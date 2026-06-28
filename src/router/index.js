import { createRouter, createWebHistory } from 'vue-router'
import { useResiliaStore } from '../stores/resiliaStore'
import { isAllowedRoute } from '../utils/safeNavigate'

const routes = [
    {
        path: '/',
        name: 'landing',
        component: () => import('../views/Landing.vue'),
    },
    {
        path: '/auth',
        name: 'auth',
        component: () => import('../views/AuthPage.vue'),
    },
    {
        path: '/onboarding',
        name: 'onboarding',
        component: () => import('../views/Onboarding.vue'),
    },
    {
        path: '/journal',
        name: 'journal',
        component: () => import('../views/SelfCheckIn.vue'),
    },
    {
        path: '/soothing',
        name: 'soothing',
        component: () => import('../views/SoothingMode.vue'),
    },
    {
        path: '/home',
        name: 'home',
        component: () => import('../views/Home.vue'),
    },
    {
        path: '/academy',
        name: 'academy',
        component: () => import('../views/Academy.vue'),
    },
    {
        path: '/academy/lesson/:id',
        name: 'lesson',
        component: () => import('../views/Lesson.vue'),
    },
    {
        path: '/academy/rpg/:id',
        name: 'rpg',
        component: () => import('../views/RpgQuestView.vue'),
    },
    {
        path: '/wallet',
        name: 'wallet',
        component: () => import('../views/Wallet.vue'),
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('../views/Dashboard.vue'),
    },
    {
        path: '/daily',
        name: 'daily-missions',
        component: () => import('../views/DailyMissions.vue'),
    },
    {
        path: '/profile',
        name: 'profile',
        component: () => import('../views/Profile.vue'),
    },
    {
        path: '/toolkit',
        name: 'toolkit',
        component: () => import('../views/Toolkit.vue'),
    },
    {
        path: '/academy/foundations/:id',
        name: 'foundations-lesson',
        component: () => import('../views/BeginnerLesson.vue'),
    },
    {
        path: '/terms',
        name: 'terms',
        component: () => import('../views/TermsOfService.vue'),
    },
    {
        path: '/privacy',
        name: 'privacy',
        component: () => import('../views/PrivacyPolicy.vue'),
    },
    {
        path: '/academy/erq/:phase',
        name: 'erq-test',
        component: () => import('../views/ERQTest.vue'),
    },
    {
        path: '/admin',
        name: 'admin-hub',
        component: () => import('../views/AdminHub.vue'),
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

const publicRoutes = ['landing', 'auth', 'onboarding', 'terms', 'privacy']

router.beforeEach((to, from, next) => {
    const store = useResiliaStore()

    // Allowlist validation, block navigation to unknown routes
    if (!isAllowedRoute(to.path)) {
        console.warn(`[router] Blocked navigation to disallowed path: ${to.path}`)
        return next({ name: store.isAuthenticated ? 'home' : 'auth' })
    }

    const sessionTs = parseInt(localStorage.getItem('resilia_session_ts') || '0')
    if (sessionTs && Date.now() - sessionTs > 6 * 60 * 60 * 1000) {
        store.logoutUser()
    }

    if (!publicRoutes.includes(to.name) && !store.isAuthenticated) {
        next({ name: 'auth' })
    }
    else if (!publicRoutes.includes(to.name) && !store.onboarded && to.name !== 'journal' && to.name !== 'soothing') {
        next({ name: 'onboarding' })
    }
    else if (to.name === 'journal' && store.hasCompletedCheckIn) {
        next({ name: 'home' })
    } else if (!store.hasCompletedCheckIn && store.onboarded && !publicRoutes.includes(to.name) && to.name !== 'journal' && to.name !== 'soothing' && to.name !== 'lia-eval') {
        next({ name: 'journal' })
    } else if (to.name === 'lesson') {
        const moduleId = parseInt(to.params.id)
        const mod = store.modules.find(m => m.id === moduleId)
        if (mod && mod.status === 'locked') {
            next({ name: 'academy' })
        } else {
            next()
        }
    } else {
        next()
    }
})

export default router

