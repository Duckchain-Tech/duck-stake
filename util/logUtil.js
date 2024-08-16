export const logger = {
    // placeholder
    info: function (...data) {
        console.log(new Date().toISOString(), ...data);
    },

    // placeholder
    error:function(...data){
        console.error(new Date().toISOString(),...data);
    }
}
