import fs from 'fs';

type Credentials = {
  client_id: string;
  client_secret: string;
  code: string;
};

type GithubAccessToken = {
  access_token: string;
  token_type: string;
  scope: string;
  error?: string;
};

type GithubUserAccount = {
  message?: string;
  access_token: string;
  avatar_url: string;
  login: string;
  name: string;
};

/**
 * 5. API: client_id、client_secret、client_codeを用いて、
 * GithubAccess_tokenを要求する
 * @param credentials
 */
const requestGithubToken = async (credentials: Credentials): Promise<GithubAccessToken> => {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(credentials)
  });
  const data = await response.json();

  console.log('🐳', data);
  return data;
};

/**
 * 7. API: access_tokenを用いてユーザー情報を要求する
 * @param access_token
 */
const requestGithubUserAccount = async (access_token: string): Promise<GithubUserAccount> => {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  });
  const data = await response.json();

  console.log('🐊', data);
  return data;
};

export const authorizeWithGithub = async (credentials: Credentials): Promise<GithubUserAccount> => {
  const { access_token } = await requestGithubToken(credentials);
  const githubUser = await requestGithubUserAccount(access_token);
  return { ...githubUser, access_token };
};

export const uploadStream = async (stream: any, path: string): Promise<void> => {
  await new Promise((resolve, reject) => {
    stream
      .on('error', (error: any) => {
        if (stream.truncated) {
          fs.unlinkSync(path);
        }
        reject(error);
      })
      .on('end', resolve)
      .pipe(fs.createWriteStream(path));
  });
};
