import i18n from 'i18next'
import { BreadcrumbType, breadcrumbPages } from 'src/entities/app/BreadcrumbPages'

const defaultPage = {
  path: '',
  title: '',
  secondTitle: ''
}

export const generatePathTitles = (path: string, is_secondary_school: boolean | null) => {
  const titles: BreadcrumbType[] = []
  const breadcrumb = breadcrumbPages.find(item => path.startsWith(item.path)) || defaultPage
  const pagePath = breadcrumb?.path
  const pageTitle =
    breadcrumb && is_secondary_school === false && breadcrumb.secondTitle ? breadcrumb.secondTitle : breadcrumb.title

  if (pageTitle) {
    if (path.includes('view')) {
      titles.push({ title: i18n.t(pageTitle), url: pagePath })
      titles.push({ title: i18n.t(pageTitle) + i18n.t('BreadcrumbDetails'), url: null })
    } else if (path.includes('edit')) {
      titles.push({ title: i18n.t(pageTitle), url: pagePath })
      titles.push({ title: i18n.t(pageTitle) + i18n.t('BreadcrumbDetails'), url: pagePath })
      titles.push({ title: i18n.t(pageTitle) + i18n.t('BreadcrumbEdit'), url: null })
    } else if (path.includes('create')) {
      titles.push({ title: i18n.t(pageTitle), url: pagePath })
      titles.push({ title: i18n.t(pageTitle) + i18n.t('BreadcrumbCreate'), url: null })
    }
  }

  return titles
}
