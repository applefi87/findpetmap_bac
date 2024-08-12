import 'dotenv/config'
import { AuthorizationCode } from 'simple-oauth2';
// ...

const oauth2 = new AuthorizationCode({
  client: {
    id: process.env.OAUTH_CLIENT_ID,
    secret: process.env.OAUTH_CLIENT_SECRET,
  },
  auth: {
    tokenHost: 'https://www.googleapis.com',
    tokenPath: '/oauth2/v4/token',
  },
});
const accessToken = oauth2.createToken({
  access_token: process.env.OAUTH_ACCESS_TOKEN,
  refresh_token: process.env.OAUTH_REFRESH_TOKEN,
  expires_in: 3599,//秒為單位 (這不能改，只是打這當範例了解google規定的過期時間)
});
//來這換refreshtoken
// https://developers.google.com/oauthplayground/
export async function getNewAccessToken() {
  try {
    console.log('Getting new access token');
    const refreshedToken = await accessToken.refresh();
    console.log('Get new access token!');
    return refreshedToken.token.access_token;
  } catch (error) {
    throw error;
  }
}
