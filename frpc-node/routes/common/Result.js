
const Result={
    success:function(data){
        return {
            code:200,
            data:data
        }
    },
    error:function(message){
        return {
            code: 500,
            message:message
        }
    }
}

export default Result