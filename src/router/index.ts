import { createRouter, createWebHistory } from "vue-router";

// Views Principales
import LoginView from "@/modules/auth/views/LoginView.vue";
import MainLayout from "@/components/layouts/MainLayout.vue";
import DashboardView from "@/modules/dashboards/views/DashboardView.vue";
import UnauthorizedView from "@/views/UnauthorizedView.vue";
// 👇 La lista de campeonatos está en la carpeta 'detail'
import ChampionshipsListView from "@/modules/championships/views/detail/ChampionshipsListView.vue";
import ChampionshipsFormView from "@/modules/championships/views/ChampionshipsFormView.vue";
import UsersView from "@/modules/users/views/UsersView.vue";
import StudentsView from "@/modules/students/views/StudentsView.vue";
import AcademiesView from "@/modules/academies/views/AcademiesView.vue";

// Views de Detalle de Campeonato (Layout y Tabs)
import ChampionshipsDetailView from "@/modules/championships/views/detail/ChampionshipsDetailView.vue"; // El Layout
import ChampionshipsInfoView from "@/modules/championships/views/detail/tabs/ChampionshipsInfoView.vue";
// 👇 Importamos el componente de Categorías
import ChampionshipsCategoriesView from "@/modules/championships/views/detail/tabs/ChampionshipsCategoriesView.vue";
import ChampionshipsParticipantsView from "@/modules/championships/views/detail/tabs/ChampionshipsParticipantsView.vue";
import ChampionshipsBracketsView from "@/modules/championships/views/detail/tabs/ChampionshipsBracketsView.vue";

const routes = [
  { path: "/login", name: "login", component: LoginView, meta: { public: true } },
  { path: "/unauthorized", name: "unauthorized", component: UnauthorizedView, meta: { public: false } },
  {
    path: "/",
    component: MainLayout,
    children: [
      { 
        path: "", 
        name: "dashboard", 
        component: DashboardView,
        meta: { roles: ['Administrador', 'Entrenador'] } // Ambos pueden ver
      },

      // --- Rutas de Campeonatos ---
      {
        path: "championships",
        name: "championships",
        component: ChampionshipsListView,
        meta: { roles: ['Administrador', 'Entrenador'] } // Ambos pueden ver
      },
      {
        path: "championships/new",
        name: "championships-create",
        component: ChampionshipsFormView,
        meta: { roles: ['Administrador', 'Entrenador'] }
      },
      {
        path: "championships/:id/editar",
        name: "championships-edit",
        component: ChampionshipsFormView,
        meta: { roles: ['Administrador', 'Entrenador'] }
      },
      {
        // Ruta Padre: DetailView (Layout)
        path: "championships/:id",
        component: ChampionshipsDetailView,
        meta: { roles: ['Administrador', 'Entrenador'] },
        // Rutas Hijas (Tabs)
        children: [
          {
            path: "", // Ruta por defecto (/championships/:id)
            name: "championships-detail", // O 'championships-info'
            component: ChampionshipsInfoView,
            meta: { roles: ['Administrador', 'Entrenador'] }
          },
          {
            // 👇 RUTA AÑADIDA PARA CATEGORÍAS
            path: "categorias",
            name: "championships-categories",
            component: ChampionshipsCategoriesView, // Usa el componente importado
            meta: { roles: ['Administrador', 'Entrenador'] }
          },
          {
            path: "competidores",
            name: "championships-competitors",
            component: ChampionshipsParticipantsView,
            meta: { roles: ['Administrador', 'Entrenador'] }
          },
          {
            path: "brackets",
            name: "championships-brackets",
            component: ChampionshipsBracketsView,
            meta: { roles: ['Administrador', 'Entrenador'] }
          },
        ],
      },
      // ------------------------------

      { 
        path: "students", 
        name: "students", 
        component: StudentsView,
        meta: { roles: ['Administrador', 'Entrenador'] } // Ambos pueden ver
      },
      { 
        path: "academies", 
        name: "academies", 
        component: AcademiesView,
        meta: { roles: ['Administrador'] } // Solo administrador
      },
      { 
        path: "users", 
        name: "users", 
        component: UsersView,
        meta: { roles: ['Administrador'] } // Solo administrador
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Auth y Role Middleware
router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userRole = localStorage.getItem("userRole");
  
  // Rutas públicas (login, unauthorized)
  if (to.meta.public) {
    if (isAuthenticated && to.path === "/login") {
      return next("/");
    }
    return next();
  }
  
  // Verificar autenticación
  if (!isAuthenticated) {
    return next("/login");
  }
  
  // Verificar que el rol sea válido (no null, no "null", no undefined, no "undefined")
  if (!userRole || userRole === "null" || userRole === "undefined") {
    console.warn("⚠️ Sesión inválida: rol no encontrado o inválido", { userRole });
    // Limpiar sesión inválida
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userRoleId");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return next("/login");
  }
  
  // Verificar permisos de rol
  if (to.meta.roles && Array.isArray(to.meta.roles)) {
    const allowedRoles = to.meta.roles as string[];
    
    if (!allowedRoles.includes(userRole)) {
      // Usuario no tiene permiso - mostrar página de acceso denegado
      console.warn(`❌ Acceso denegado: Rol "${userRole}" no autorizado para esta ruta`);
      return next("/unauthorized");
    }
  }
  
  console.log(`✅ Acceso permitido - Rol: "${userRole}" - Ruta: ${to.path}`)
  next();
});

export default router;