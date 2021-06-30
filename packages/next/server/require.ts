import { promises } from 'fs'
import { join } from 'path'
import {
  PAGES_MANIFEST,
  SERVER_DIRECTORY,
  FONT_MANIFEST,
} from '../shared/lib/constants'
import { normalizePagePath, denormalizePagePath } from './normalize-page-path'
import { PagesManifest } from '../build/webpack/plugins/pages-manifest-plugin'
import { normalizeLocalePath } from '../shared/lib/i18n/normalize-locale-path'

export function pageNotFoundError(page: string): Error {
  const err: any = new Error(`Cannot find module for page: ${page}`)
  err.code = 'ENOENT'
  return err
}

export function getPagePath(
  page: string,
  distDir: string,
  locales?: string[]
): string {
  const serverBuildPath = join(distDir, SERVER_DIRECTORY)
  const pagesManifest = require(join(
    serverBuildPath,
    PAGES_MANIFEST
  )) as PagesManifest

  try {
    page = denormalizePagePath(normalizePagePath(page))
  } catch (err) {
    console.error(err)
    throw pageNotFoundError(page)
  }
  let pagePath = pagesManifest[page]

  if (!pagesManifest[page] && locales) {
    const manifestNoLocales: typeof pagesManifest = {}

    for (const key of Object.keys(pagesManifest)) {
      manifestNoLocales[normalizeLocalePath(key, locales).pathname] =
        pagesManifest[key]
    }
    pagePath = manifestNoLocales[page]
  }

  if (!pagePath) {
    throw pageNotFoundError(page)
  }
  return join(serverBuildPath, pagePath)
}

export function requirePage(page: string, distDir: string): any {
  const pagePath = getPagePath(page, distDir)
  if (pagePath.endsWith('.html')) {
    return promises.readFile(pagePath, 'utf8')
  }
  return require(pagePath)
}

export function requireFontManifest(distDir: string) {
  const serverBuildPath = join(distDir, SERVER_DIRECTORY)
  const fontManifest = require(join(serverBuildPath, FONT_MANIFEST))
  return fontManifest
}
