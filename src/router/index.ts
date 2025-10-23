import { createRouter, createWebHistory } from "vue-router"

// Views
import LoginView from "@/modules/auth/views/LoginView.vue"
import MainLayout from "@/components/layouts/MainLayout.vue"
import DashboardView from "@/modules/dashboards/views/DashboardView.vue"
// 👇 Corregí la ruta, tu ListView está en 'views', no 'views/detail'
import ChampionshipsListView from "@/modules/championships/views/detail/ChampionshipsListView.vue"
import ChampionshipsFormView from "@/modules/championships/views/ChampionshipsFormView.vue"
import UsersView from "@/modules/users/views/UsersView.vue"
import StudentsView from "@/modules/students/views/StudentsView.vue"
import AcademiesView from "@/modules/academies/views/AcademiesView.vue"
// import StudentDetailView from "@/modules/students/views/StudentDetailView.vue" // detail

const routes = [
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { public: true },
  },
  {
    path: "/",
    component: MainLayout,
    children: [
      { path: "", name: "dashboard", component: DashboardView },
      
      // --- Rutas de Campeonatos ---
      { 
        path: "championships", 
        name: "championships", 
        component: ChampionshipsListView 
      },
      {
        path: "championships/new",
        name: "championships-create",
        component: ChampionshipsFormView,
      },
      // 👇 ¡ESTA ES LA RUTA QUE FALTABA!
      // Apunta al mismo componente que 'create'
      {
        path: "championships/:id/editar", // El 'id' debe coincidir con el param
        name: "championships-edit",       // El nombre debe coincidir con el router.push
        component: ChampionshipsFormView,
      },
      // ------------------------------

      { path: "students", name: "students", component: StudentsView }, 
      { path: "academies", name: "academies", component: AcademiesView },
      { path: "users", name: "users", component: UsersView },
      // LIST
      // { path: "students/:id", name: "student-detail", component: StudentDetailView }, // DETAIL
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 🧩 Auth Middleware
router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"

  if (!to.meta.public && !isAuthenticated) {
    next("/login")
  } else if (to.meta.public && isAuthenticated && to.path === "/login") {
    next("/")
  } else {
    next()
  }
})

export default router