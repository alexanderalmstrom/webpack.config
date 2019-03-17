// server/index.js

const path = require('path')
const express = require('express')
const serverless = require('serverless-http')
const bodyParser = require('body-parser')

const app = express()
const server = serverless(app)

// parse application/json
app.use(bodyParser.json())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static(path.resolve(process.cwd(), 'public')))

module.exports = app
module.exports.handler = serverless(app)