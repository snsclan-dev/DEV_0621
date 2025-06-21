const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "in-v3.mailjet.com", port: 587, secure: false, // Use `true` for port 465, `false` for all other ports
    auth: { user: process.env.MAIL_KEY, pass: process.env.MAIL_SECRET }
});
const $APP_NAME = process.env.APP_NAME.toUpperCase()
const mailer = async (id, email, code)=>{ // code: pass_salt
    if(process.env.NODE_ENV === 'production'){
        try{
            await transporter.sendMail({
                from: `"${$APP_NAME}" < ${process.env.MAIL_ADMIN} >`, // sender address
                to: `${email}`, // list of receivers
                subject: `${$APP_NAME} 회원가입 인증 메일입니다.`, // Subject line
                text: `인증 : ${email}`, // plain text body
                html: `
                    <p>${$APP_NAME} 회원가입 인증 메일입니다.</p>
                    <br/>
                    <p>아이디 : ${id}</p>
                    <br/>
                    <p>이메일 : ${email}</p>
                    <br/>
                    <p>인증(클릭) : ${process.env.APP_URL}/auth/${id}/${code}</p>
                    <br/>
                `, // html body
            });
            return { code: 0 }
        }catch(err){
            checkError(err, '/modules/mailer.js, 회원가입 이메일 발송 오류!')
            return { code: 1, msg: '회원가입 이메일 발송 오류!' }
        }
    }
}
// transporter.verify((error, success) => {
//     if (error) {
//         console.error("SMTP 서버 연결 오류:", error);
//     } else {
//         console.log("SMTP 서버 연결 성공:", success);
//     }
// });

module.exports = mailer;