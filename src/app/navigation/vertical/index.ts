// ** Type import
import { VerticalNavItemsType } from 'src/shared/layouts/types'

const navigation = (total: string | undefined): VerticalNavItemsType => {
  return [
    {
      sectionTitle: 'Menu'
    },
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: 'tabler:dashboard',
      action: 'read',
      subject: 'dashboard'
    },
    {
      title: 'Users',
      path: '/users',
      icon: 'tabler:users',
      action: 'read',
      subject: 'admin_users'
    },
    {
      title: 'Classrooms',
      path: '/classrooms',
      icon: 'tabler:box-multiple',
      action: 'read',
      subject: 'admin_classrooms'
    },
    {
      title: 'Subjects',
      path: '/subjects',
      icon: 'tabler:book-2',
      action: 'read',
      subject: 'admin_subjects'
    },
    {
      title: 'Timetables',
      path: '/timetables',
      icon: 'tabler:file-text',
      action: 'read',
      subject: 'admin_timetables'
    },
    {
      title: 'Schools',
      path: '/schools',
      icon: 'tabler:building-skyscraper',
      action: 'read',
      subject: 'admin_schools'
    },
    {
      title: 'Shifts',
      path: '/shifts',
      icon: 'tabler:clock-hour-4',
      action: 'read',
      subject: 'admin_shifts'
    },
    {
      title: 'Periods',
      path: '/periods',
      icon: 'tabler:layout-columns',
      action: 'read',
      subject: 'admin_periods'
    },
    {
      title: 'Rating',
      path: '/users/rating',
      icon: 'tabler:presentation',
      action: 'read',
      subject: 'rating'
    },
    {
      title: 'AdministrationTools',
      icon: 'tabler:tools',
      ...(total && Number(total) > 0
        ? {
            badgeColor: 'warning',
            badgeContent: ' '
          }
        : {}),
      children: [
        {
          title: 'ReportForms',
          path: '/tools/report-forms',
          action: 'read',
          ...(total && Number(total) > 0
            ? {
                badgeColor: 'warning',
                badgeContent: total
              }
            : {}),
          subject: 'tool_report_forms'
        },
        {
          title: 'Reports',
          path: '/tools/reports',
          action: 'read',
          subject: 'tool_reports'
        },
        {
          title: 'JournalExportTitle',
          path: '/tools/export',
          action: 'read',
          subject: 'tool_export'
        },
        {
          title: 'TeacherExcuses',
          path: '/teacher-excuses',
          action: 'read',
          subject: 'admin_teacher_excuses'
        },
        {
          title: 'Payments',
          path: '/payments',
          action: 'read',
          subject: 'admin_payments'
        },
        {
          title: 'Data',
          path: '/tools/data',
          action: 'read',
          subject: 'tool_reports_data'
        },
        {
          title: 'Notifications',
          path: '/tools/notifications/inbox/0',
          action: 'read',
          subject: 'tool_notifier'
        }
      ]
    },
    {
      title: 'Settings',
      path: '/settings/general',
      icon: 'tabler:settings',
      action: 'read',
      subject: 'admin_settings'
    },
    {
      title: 'Journal',
      path: 'https://mekdep.edu.tm/mobile',
      icon: 'tabler:book',
      secondIcon: 'tabler:external-link',
      action: 'read',
      subject: 'journal',
      openInNewTab: true
    }
  ]
}

export const VerticalEduCenterNavItems = (total: string | undefined): VerticalNavItemsType => {
  return [
    {
      sectionTitle: 'Menu'
    },
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: 'tabler:dashboard',
      action: 'read',
      subject: 'dashboard'
    },
    {
      title: 'Users',
      path: '/users',
      icon: 'tabler:users',
      action: 'read',
      subject: 'admin_users'
    },
    {
      title: 'Groups',
      path: '/classrooms',
      icon: 'tabler:box-multiple',
      action: 'read',
      subject: 'admin_classrooms'
    },
    {
      title: 'Seasons',
      path: '/periods',
      icon: 'tabler:layout-columns',
      action: 'read',
      subject: 'admin_periods'
    },
    {
      title: 'Shifts',
      path: '/shifts',
      icon: 'tabler:clock-hour-4',
      action: 'read',
      subject: 'admin_shifts'
    },
    {
      title: 'EduCenters',
      path: '/schools',
      icon: 'tabler:building-skyscraper',
      action: 'read',
      subject: 'admin_schools'
    },
    {
      title: 'Courses',
      path: '/base-subjects',
      icon: 'tabler:book-2',
      action: 'read',
      subject: 'admin_subjects'
    },
    {
      title: 'Rating',
      path: '/users/rating',
      icon: 'tabler:presentation',
      action: 'read',
      subject: 'rating'
    },
    {
      title: 'AdministrationTools',
      icon: 'tabler:tools',
      ...(total && Number(total) > 0
        ? {
            badgeColor: 'warning',
            badgeContent: ' '
          }
        : {}),
      children: [
        {
          title: 'ReportForms',
          path: '/tools/report-forms',
          action: 'read',
          ...(total && Number(total) > 0
            ? {
                badgeColor: 'warning',
                badgeContent: total
              }
            : {}),
          subject: 'tool_report_forms'
        },
        {
          title: 'Reports',
          path: '/tools/reports',
          action: 'read',
          subject: 'tool_reports'
        },
        {
          title: 'JournalExportTitle',
          path: '/tools/export',
          action: 'read',
          subject: 'tool_export'
        },
        {
          title: 'TeacherExcuses',
          path: '/teacher-excuses',
          action: 'read',
          subject: 'admin_teacher_excuses'
        },
        {
          title: 'Payments',
          path: '/payments',
          action: 'read',
          subject: 'admin_payments'
        },
        {
          title: 'Data',
          path: '/tools/data',
          action: 'read',
          subject: 'tool_reports_data'
        },
        {
          title: 'Notifications',
          path: '/tools/notifications/inbox/0',
          action: 'read',
          subject: 'tool_notifier'
        }
      ]
    },
    {
      title: 'Settings',
      path: '/settings/general',
      icon: 'tabler:settings',
      action: 'read',
      subject: 'admin_settings'
    },
    {
      title: 'Journal',
      path: 'https://mekdep.edu.tm/mobile',
      icon: 'tabler:book',
      secondIcon: 'tabler:external-link',
      action: 'read',
      subject: 'journal',
      openInNewTab: true
    }
  ]
}

export default navigation
