// this function creates a new product and returns the product
require('dotenv').config()
const STRIPE_SK_DEV = process.env.STRIPE_SK_DEV
const STRIPE_SK_PROD = process.env.STRIPE_SK_PROD
const BASE_URL = process.env.NODE_ENV === 'production' ? process.env.BASE_URL : 'http://localhost:1337'
const headers = {
  'Access-Control-Allow-Origin': BASE_URL,
  'Access-Control-Allow-Headers': 'Content-Type',
}

exports.handler = async function (event, context) {
  // CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
    }
  }

  if (event.httpMethod === 'GET' || event.httpMethod === 'PUT') {
    return {
      statusCode: 405,
      headers,
      message: 'Method Not Allowed',
    }
  }

  if (event.httpMethod === 'POST') {
    const entity = JSON.parse(event.body)
    const ENV = entity.environment
    const STRIPE_GENERAL_PRODUCT =
      ENV === 'production' ? process.env.STRIPE_GENERAL_PRODUCT_ID_PROD : process.env.STRIPE_GENERAL_PRODUCT_ID_DEV
    const STRIPE_SK = ENV === 'production' ? STRIPE_SK_PROD : STRIPE_SK_DEV
    const stripe = require('stripe')(STRIPE_SK)

    if (entity.product !== STRIPE_GENERAL_PRODUCT) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Product field already populated',
        }),
      }
    }

    const product = await stripe.products.create({
      name: entity.title,
      description: entity.description,
      images: [entity.cover],
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(product),
    }
  }

  if (event.httpMethod === 'DELETE') {
    const entity = JSON.parse(event.body)
    const ENV = entity.environment
    const STRIPE_GENERAL_PRODUCT =
      ENV === 'production' ? process.env.STRIPE_GENERAL_PRODUCT_ID_PROD : process.env.STRIPE_GENERAL_PRODUCT_ID_DEV
    const STRIPE_SK = ENV === 'production' ? STRIPE_SK_PROD : STRIPE_SK_DEV
    const stripe = require('stripe')(STRIPE_SK)

    if (entity.product === STRIPE_GENERAL_PRODUCT) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Cannot delete the general product',
        }),
      }
    }

    const product = await stripe.products.del(entity.product)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(product),
    }
  }
}
