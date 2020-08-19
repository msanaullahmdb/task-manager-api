
const sgMail = require('@sendgrid/mail')



sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const taskappWelcome = (email,name) => {
    sgMail.send({
        to: email,
        from: 'msanaullahmdb@gmail.com',
        subject: 'Welcome to task app',
        text: `hi ${name} most welcome to task app how can i help you` 
    })
}


const sendCancelMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'msanaullahmdb@gmail.com',
        subject: 'Successfully deleted your account',
        text: ` Hi ${name} i hope a will see you back `
    })
}



module.exports = {
    taskappWelcome,
    sendCancelMail
}

