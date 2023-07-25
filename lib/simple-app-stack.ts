import * as cdk from 'aws-cdk-lib';
import { BlockPublicAccess, Bucket, BucketAccessControl, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs';
import * as path from 'path'
import {BucketDeployment, Source} from 'aws-cdk-lib/aws-s3-deployment';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class SimpleAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const bucket = new Bucket(this, 'MySimpleAppBucket', {
      encryption: BucketEncryption.S3_MANAGED,
    });

    new BucketDeployment(this, 'MySimpleAppPhotos', {
      sources: [
        Source.asset(path.join(__dirname, '..', 'photos'))
      ],
      destinationBucket: bucket
    })

    const websiteBucket = new Bucket(this, 'MySimpleAppWebsiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
      accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL
    });

    new BucketDeployment(this, 'MySimpleAppWebsiteDeploy', {
      sources: [Source.asset(path.join(__dirname, '..', 'frontend', 'build'))],
      destinationBucket: websiteBucket
    })

    const getPhotos = new lambda.Function(this, 'MySimpleAppLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      // code: lambda.Code.fromAsset(path.join(__dirname, '..', 'api', 'get-photos', 'index.ts')),
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'api', 'get-photos')),
      handler: 'index.handler',
      environment: {
        PHOTO_BUCKET_NAME: bucket.bucketName,
      }
    })

    const bucketContainerPermissions = new PolicyStatement();
    bucketContainerPermissions.addResources(bucket.bucketArn);
    bucketContainerPermissions.addActions('s3:ListBucket');

    const bucketPermissions = new PolicyStatement();
    bucketPermissions.addResources(`${bucket.bucketArn}/*`);
    bucketPermissions.addActions('s3:GetObject', 's3:PutObject');

    getPhotos.addToRolePolicy(bucketContainerPermissions);
    getPhotos.addToRolePolicy(bucketPermissions);

    // const httpApi = new apigateway.RestApi(this, 'books-api', {
    //   defaultCorsPreflightOptions:{
    //     allowOrigins: ['*'],
    //     allowMethods: [lambda.HttpMethod.GET]
    //   },
    //   restApiName: 'photo-api'
    // });

    // const lambdaIntegration = new apigateway.LambdaIntegration(getPhotos);

    // const photos = httpApi.root.addResource('getAllPhotos');
    // photos.addMethod('GET');

    const lambdaApi = new apigateway.LambdaRestApi(this, 'myapi', {
      handler: getPhotos,
      proxy: false
    });

    const items = lambdaApi.root.addResource('getAllPhotos');
    items.addMethod('GET');  // GET /getAllPhotos



    new cdk.CfnOutput(this, 'MySimpleAppBucketNameExport', {
        value: bucket.bucketName,
        exportName: 'MySimpleAppBucketName',
    });

    new cdk.CfnOutput(this, 'MySimpleAppWebsiteBucketNameExport', {
      value: websiteBucket.bucketName,
      exportName: 'MySimpleAppWebsiteBucketName',
  });


    new cdk.CfnOutput(this, 'MySimpleAppApi', {
      value: lambdaApi.url,
      exportName: 'MySimpleAppApiEndpoint'
    });

    // example resource
    // const queue = new sqs.Queue(this, 'SimpleAppQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
