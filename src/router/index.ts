import { createRouter, createWebHistory } from "vue-router";

// Views Principales
import LoginView from "@/modules/auth/views/LoginView.vue";
import MainLayout from "@/components/layouts/MainLayout.vue";
import DashboardView from "@/modules/dashboards/views/DashboardView.vue";
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
  {
    path: "/",
    component: MainLayout,
    children: [
      { path: "", name: "dashboard", component: DashboardView },

      // --- Rutas de Campeonatos ---
      {
        path: "championships",
        name: "championships",
        component: ChampionshipsListView,
      },
      {
        path: "championships/new",
        name: "championships-create",
        component: ChampionshipsFormView,
      },
      {
        path: "championships/:id/editar",
        name: "championships-edit",
        component: ChampionshipsFormView,
      },
      {
        // Ruta Padre: DetailView (Layout)
        path: "championships/:id",
        component: ChampionshipsDetailView,
        // Rutas Hijas (Tabs)
        children: [
          {
            path: "", // Ruta por defecto (/championships/:id)
            name: "championships-detail", // O 'championships-info'
            component: ChampionshipsInfoView,
          },
          {
            // 👇 RUTA AÑADIDA PARA CATEGORÍAS
            path: "categorias",
            name: "championships-categories",
            component: ChampionshipsCategoriesView, // Usa el componente importado
          },
          {
            path: "competidores",
            name: "championships-competitors",
            component: ChampionshipsParticipantsView,
          },
          {
            path: "brackets",
            name: "championships-brackets",
            component: ChampionshipsBracketsView,
          },
        ],
      },
      // ------------------------------

      { path: "students", name: "students", component: StudentsView },
      { path: "academies", name: "academies", component: AcademiesView },
      { path: "users", name: "users", component: UsersView },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Auth Middleware (Sin cambios)
router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  if (!to.meta.public && !isAuthenticated) next("/login");
  else if (to.meta.public && isAuthenticated && to.path === "/login") next("/");
  else next();
});

export default router;