const { S3 } = require("aws-sdk");

const bucketName = process.env.PHOTO_BUCKET_NAME;

function generateUrl(asset){

}


exports.handler = async function (event, context)
{
    console.log("BuccketName: " + bucketName);
    var a = "HELLO"
    try{
        const { Contents: results } = await S3.listObjects({Bucket: bucketName}).promise();
        const photos = await Promise.all(results.map(result => generateUrl(result)));

        return {
            statusCode: 200,
            body: JSON.stringify(photos),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: error.message
        };
    }
}