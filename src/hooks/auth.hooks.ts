import { Role } from '@/constants/type'
import { AuthError, ForbiddenError } from '@/utils/errors'
import { verifyAccessToken } from '@/utils/jwt'
import { FastifyRequest } from 'fastify'

export const pauseApiHook = async (request: FastifyRequest) => {
  // throw new ForbiddenError('Chức năng bị tạm ngưng')
}

export const requireLoginedHook = async (request: FastifyRequest) => {
  const accessToken = request.headers.authorization?.split(' ')[1]
  if (!accessToken) throw new AuthError('Not received token')
  try {
    const decodedAccessToken = verifyAccessToken(accessToken)
    request.decodedAccessToken = decodedAccessToken
  } catch (error) {
    throw new AuthError('Access token is invalid')
  }
}

export const requireOwnerHook = async (request: FastifyRequest) => {
  if (request.decodedAccessToken?.role !== Role.Owner) {
    throw new AuthError('You do not have access')
  }
}

export const requireEmployeeHook = async (request: FastifyRequest) => {
  if (request.decodedAccessToken?.role !== Role.Employee) {
    throw new AuthError('You do not have access')
  }
}

export const requireGuestHook = async (request: FastifyRequest) => {
  if (request.decodedAccessToken?.role !== Role.Guest) {
    throw new AuthError('You do not have access')
  }
}
