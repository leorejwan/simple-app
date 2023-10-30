const { S3 } = require("aws-sdk");
const s3 = new S3();

const bucketName = process.env.PHOTO_BUCKET_NAME;

async function generateUrl(asset){
    const url = await s3.getSignedUrlPromise('getObject', {
        Bucket: bucketName,
        Key: asset.Key,
        Expires: 24 * 60 * 60
    })

    return {
        filename: asset.Key,
        url
    }
}


exports.handler = async function (event, context)
{
    console.log("BuccketName: " + bucketName);
    try{
        const { Contents: results } = await s3.listObjects({Bucket: bucketName}).promise();
        const photos = await Promise.all(results.map(result => generateUrl(result)));

        var response = {
            "statusCode": 200,
            "body": JSON.stringify(photos)
        }

        return response;
    } catch (error) {
        var response = {
            "statusCode": 500,
            "body": error.message
        }
        return response;
    }
}