module.exports = (dplLogo, title, link) => `<!DOCTYPE html>
<html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Nunito">
        <link href="https://fonts.googleapis.com/css2?family=Pridi:wght@300&display=swap" rel="stylesheet">
        <title>${title}</title>
        <style>
            .container {
                height: 100vh;
                width: 100%;
                align-items: center;
                display: flex;
                justify-content: center;
                background: transparent;
                color: #ffffff;

            }

            .card {
                position: relative;
                width: 888px;
                height: 908px;
                background: #FFFFFF;
                padding: 10px 30px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .card_mini {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: absolute;
                width: 750px;
                height: 843.05px;
                margin-top: 50px;
            }

            .button {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                padding: 12px 32px;
                gap: 24px;
                width: 570px;
                height: 85px;
                background: #3B4CF1;
                border-radius: 8px;
                margin-top: 40px;
                cursor: pointer;
            }

            .proud {
                display: flex;
                flex-direction: row;
                align-items: center;
                margin-top: 40px;
                width: 487.02px;
                height: 51.05px;

            }
        </style>
    </head>

    <body>
        <div class="container">
            <div class="card">
                <div class="card_mini">
                    <img src="${dplLogo}" alt="" style="width: 439px;
                    height: 110px; margin-bottom: 30px;">
                    <h2 style="width: 367px; height: 22px; font-family: 'Nunito'; font-style: normal; font-weight: 700; font-size: 30px; line-height: 22px; color: #000000;
                    ">Pheww, We sent them all!</h2>
                    <p style="width: 732px; height: 100px; font-family: 'Nunito'; font-style: normal; font-weight: 500; font-size: 25px; line-height: 35px; color: #000000;
                    ">
                        We have dispatched all the emails as you ordered. Click on the
                        link below to see who received it and also download them if you
                        want to print them.</p>
                    <div class="button">
                        <a style="width: 390px; height: 40px; font-family: 'Nunito'; font-style: normal; font-weight: 700; font-size: 32px; line-height: 40px; display: flex; align-items: center; color: #FFFFFF;
                        " href="${link}">Check Status & Download</p>
                    </div>
                    <p style="width: 750px; height: 55px; margin-top: 60px; font-family: 'Nunito'; font-style: normal; font-weight: 500; font-size: 22px; line-height: 32px;
                     color: #000000; margin-left: 20px;
                    ">If you are having troubles clicking this button, or have any questions, kindly
                        reach out to us at <a style="color: #3B4CF1; cursor: pointer;">-support@docuplier.com-</a></p>
                    <div class="proud">
                        <h3 style="width: 260px; height: 23px; font-family: 'Pridi'; font-style: normal; font-weight: 300; font-size: 25px; line-height: 22px; color: #000000;
                        ">Proudly Distributed by </h3><img src="${dplLogo}" alt=""
                            style="width: 203.02px; height: 51.05px; margin-left: 15px;">
                    </div>
                </div>
            </div>
        </div>
    </body>

</html>`