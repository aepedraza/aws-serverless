# REST service (API GW + Lambda + DynamoDB)

## DynamoDB

### Create table
```
aws dynamodb create-table \
--table-name alvaropedraza.products \
--attribute-definitions \
  AttributeName=id,AttributeType=S \
--key-schema \
  AttributeName=id,KeyType=HASH \
--billing-mode PAY_PER_REQUEST \
--on-demand-throughput \
  MaxReadRequestUnits=5,MaxWriteRequestUnits=5 \
--table-class STANDARD
```

### Wait for ACTIVE
```
aws dynamodb describe-table \
--table-name alvaropedraza.products \
--query Table.TableStatus
```

## Lambda

### Role
Role should be created before. Available policy template: Simple microservice permissions (DynamoDB)

Permissions > Create a new role from AWS policy templates > Policy template

TODO: Check how to do it via aws cli

Clue: GET https://us-east-2.prod.server.console.lambda.aws.a2z.com/lambda-api/server/ezcrc-policy-templates

There is a role already available: alvaropedraza-lambda-productRole

### Create function
Make sure source code is in current directory
```
# create ZIP file
zip function.zip index.js

# Get role ARN
role_arn=$(aws iam get-role --role-name alvaropedraza-lambda-productRole --query Role.Arn | tr -d '"')

# Create function
aws lambda create-function --function-name alvaropedraza-productFunction \
--runtime nodejs22.x \
--zip-file fileb://function.zip \
--handler index.handler \
--role $role_arn
```

## API Gateway

### Create REST API
```
# Create the API
aws apigateway create-rest-api \
--name alvaropedraza-product-api

# Create resource /product
aws apigateway create-resource \
--rest-api-id $rest_api_id \
--parent-id $root_resource_id \
--path-part product

# Create methods
aws apigateway put-method \
--rest-api-id $rest_api_id \
--resource-id $product_resource_id \
--http-method GET \ --> idem for POST
--authorization-type NONE

# Integrate with Lambda function
aws apigateway put-integration \
--rest-api-id $rest_api_id \
--resource-id $product_resource_id \
--http-method GET \ --> idem for POST
--type AWS \
--integration-http-method POST \
--uri $ag_to_lambda_integration_uri

# Deploy API
aws apigateway create-deployment \
--rest-api-id $rest_api_id \
--stage-name production
```

TODO: Explore HAR taken from console. Missing steps

