import { NextResponse } from 'next/server';

const shopifyFetch = async (query: string) => {
  const { SHOPIFY_STORE_DOMAIN, SHOPIFY_ACCESS_TOKEN } = process.env;
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
    throw new Error("Shopify environment variables are not set.");
  }

  try {
    const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    });

    const json = await response.json();
    if (json.errors) {
      console.error("GraphQL Errors:", JSON.stringify(json.errors, null, 2));
      throw new Error("Failed to fetch from Shopify API");
    }
    return json.data;
  } catch (error) {
    console.error("Error fetching from Shopify:", error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let orderQueryFilter = "";
    let customerQueryFilter = "";
    if (startDate && endDate) {
      // Dates should be in ISO 8601 format
      orderQueryFilter = `query: "processed_at:>=${startDate} AND processed_at:<=${endDate}"`;
      customerQueryFilter = `query: "created_at:>=${startDate} AND created_at:<=${endDate}"`;
    }

    const metricsQuery = `
      {
        orders(first: 250, sortKey: PROCESSED_AT, reverse: true, ${orderQueryFilter}) {
          edges {
            node {
              totalPriceSet {
                shopMoney {
                  amount
                }
              }
            }
          }
        }
        customers(first: 250, sortKey: CREATED_AT, reverse: true, ${customerQueryFilter}) {
          edges {
            node {
              id
              amountSpent {
                amount
              }
            }
          }
        }
        shop {
          currencyCode
        }
      }
    `;

    const data = await shopifyFetch(metricsQuery);

    const totalRevenue = data.orders.edges.reduce((acc: number, { node }: any) => acc + parseFloat(node.totalPriceSet.shopMoney.amount), 0);
    const totalOrders = data.orders.edges.length;
    const totalCustomers = data.customers.edges.length; // This will be the number of new customers in the period
    const currencyCode = data.shop.currencyCode;

    // This will be the top spenders among the new customers in the selected period
    const topCustomers = data.customers.edges
      .map(({ node }: any) => ({
        id: node.id,
        name: `Customer #${node.id.split('/').pop()}`,
        value: parseFloat(node.amountSpent.amount),
      }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 5);

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      topCustomers,
      currencyCode
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch dashboard metrics from Shopify", details: error.message }, { status: 500 });
  }
}
