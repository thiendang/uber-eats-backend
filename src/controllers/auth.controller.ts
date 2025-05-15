import envConfig from '@/config'
import prisma from '@/database'
import { LoginBodyType } from '@/schemaValidations/auth.schema'
import { RoleType, TokenPayload } from '@/types/jwt.types'
import { comparePassword } from '@/utils/crypto'
import { AuthError, EntityError, StatusError } from '@/utils/errors'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt'
import axios from 'axios'

export const logoutController = async (refreshToken: string) => {
  await prisma.refreshToken.delete({
    where: {
      token: refreshToken
    }
  })
  return 'Logout successful'
}

export const loginController = async (body: LoginBodyType) => {
  const account = await prisma.account.findUnique({
    where: {
      email: body.email
    }
  })
  if (!account) {
    throw new EntityError([{ field: 'email', message: 'Email does not exist' }])
  }
  const isPasswordMatch = await comparePassword(body.password, account.password)
  if (!isPasswordMatch) {
    throw new EntityError([{ field: 'password', message: 'Incorrect email or password' }])
  }
  const accessToken = signAccessToken({
    userId: account.id,
    role: account.role as RoleType
  })
  const refreshToken = signRefreshToken({
    userId: account.id,
    role: account.role as RoleType
  })
  const decodedRefreshToken = verifyRefreshToken(refreshToken)
  const refreshTokenExpiresAt = new Date(decodedRefreshToken.exp * 1000)

  await prisma.refreshToken.create({
    data: {
      accountId: account.id,
      token: refreshToken,
      expiresAt: refreshTokenExpiresAt
    }
  })
  return {
    account,
    accessToken,
    refreshToken
  }
}

export const refreshTokenController = async (refreshToken: string) => {
  let decodedRefreshToken: TokenPayload
  try {
    decodedRefreshToken = verifyRefreshToken(refreshToken)
  } catch (error) {
    throw new AuthError('Refresh token is invalid')
  }
  const refreshTokenDoc = await prisma.refreshToken.findUniqueOrThrow({
    where: {
      token: refreshToken
    },
    include: {
      account: true
    }
  })
  const account = refreshTokenDoc.account
  const newAccessToken = signAccessToken({
    userId: account.id,
    role: account.role as RoleType
  })
  const newRefreshToken = signRefreshToken({
    userId: account.id,
    role: account.role as RoleType,
    exp: decodedRefreshToken.exp
  })
  await prisma.refreshToken.delete({
    where: {
      token: refreshToken
    }
  })
  await prisma.refreshToken.create({
    data: {
      accountId: account.id,
      token: newRefreshToken,
      expiresAt: refreshTokenDoc.expiresAt
    }
  })
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  }
}

/**
 * This function perform a request to get a Google OAuth token based on the authorization code received from client-side.
 * @param {string} code - Authorization code is sent from client-side.
 * @returns {Object} - Object have Google OAuth token.
 */
const getOauthGooleToken = async (code: string) => {
  const body = {
    code,
    client_id: envConfig.GOOGLE_CLIENT_ID,
    client_secret: envConfig.GOOGLE_CLIENT_SECRET,
    redirect_uri: envConfig.GOOGLE_AUTHORIZED_REDIRECT_URI,
    grant_type: 'authorization_code'
  }
  const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  return data as {
    access_token: string
    expires_in: number
    refresh_token: string
    scope: string
    token_type: string
    id_token: string
  }
}

/**
 * This function performs sending a request to get user information from Google based on the Google OAuth token.
 * @param {Object} tokens - Object containing the Google OAuth token.
 * @param {string} tokens.id_token - ID token retrieved from Google OAuth.
 * @param {string} tokens.access_token - Access token retrieved from Google OAuth.
 * @returns {Object} - Object containing user information from Google.
 */
const getGoogleUser = async ({ id_token, access_token }: { id_token: string; access_token: string }) => {
  const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
    params: {
      access_token,
      alt: 'json'
    },
    headers: {
      Authorization: `Bearer ${id_token}`
    }
  })
  return data as {
    id: string
    email: string
    verified_email: boolean
    name: string
    given_name: string
    family_name: string
    picture: string
  }
}

export const loginGoogleController = async (code: string) => {
  const data = await getOauthGooleToken(code) // Send the authorization code to get a Google OAuth token
  const { id_token, access_token } = data // Get ID token and access token from returned result
  const googleUser = await getGoogleUser({ id_token, access_token }) // Send Google OAuth token to get user information from Google
  // Check verified email from Google
  if (!googleUser.verified_email) {
    throw new StatusError({
      status: 403,
      message: 'Unverified email from Google'
    })
  }
  const account = await prisma.account.findUnique({
    where: {
      email: googleUser.email
    }
  })
  if (!account) {
    throw new StatusError({
      status: 403,
      message: 'This account does not exist on the website system.'
    })
  }
  const accessToken = signAccessToken({
    userId: account.id,
    role: account.role as RoleType
  })
  const refreshToken = signRefreshToken({
    userId: account.id,
    role: account.role as RoleType
  })
  const decodedRefreshToken = verifyRefreshToken(refreshToken)
  const refreshTokenExpiresAt = new Date(decodedRefreshToken.exp * 1000)
  await prisma.refreshToken.create({
    data: {
      accountId: account.id,
      token: refreshToken,
      expiresAt: refreshTokenExpiresAt
    }
  })
  return {
    accessToken,
    refreshToken,
    account: {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role as RoleType
    }
  }
}
