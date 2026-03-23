import type { Translations } from "./en";

const fr: Translations = {
  nav: {
    features: "Fonctionnalités",
    howItWorks: "Comment ça marche",
    pricing: "Tarifs",
    login: "Connexion",
    dashboard: "Tableau de bord",
    startFreeTrial: "Essai gratuit",
    signOut: "Déconnexion",
  },
  hero: {
    badge: "Planification intelligente pour barbiers",
    headline: "Le planning de votre barbershop,",
    headlineAccent: "Parfaitement organisé",
    subheadline: "Grid offre à votre barbershop une page de réservation professionnelle avec gestion intelligente du calendrier, support international et disponibilité en temps réel.",
    ctaPrimary: "Essai gratuit",
    ctaSecondary: "Voir comment ça marche",
    noCreditCard: "Aucune carte de crédit requise",
    trustedBy: "Approuvé par plus de 500 barbershops dans le monde",
  },
  features: {
    title: "Tout ce dont vous avez besoin pour gérer un barbershop moderne",
    subtitle: "Grid combine planification intelligente, support international et image professionnelle en une seule plateforme.",
    items: {
      calendar: {
        title: "Calendrier Grid intelligent",
        description: "Planification intelligente qui évite les doubles réservations et optimise le temps de votre équipe. Disponibilité en temps réel pour tous les barbiers.",
      },
      international: {
        title: "Prêt pour l'international",
        description: "Support pour les clients du Portugal, Brésil, Royaume-Uni, Allemagne et France avec validation et formatage des numéros locaux.",
      },
      instant: {
        title: "Mise en place instantanée",
        description: "Mettez votre barbershop en ligne en quelques minutes. URL personnalisée, page de marque et système de réservation prêts à l'emploi.",
      },
    },
  },
  stats: {
    shops: "Barbershops actifs",
    bookings: "Réservations gérées",
    countries: "Pays supportés",
    uptime: "Disponibilité",
  },
  howItWorks: {
    title: "Opérationnel en quelques minutes",
    subtitle: "Trois étapes simples pour mettre votre barbershop en ligne.",
    steps: {
      setup: { title: "Créez votre boutique", description: "Inscrivez-vous et configurez votre profil avec votre URL unique." },
      configure: { title: "Ajoutez votre équipe", description: "Ajoutez des barbiers, services et tarifs. Tout au même endroit." },
      launch: { title: "Lancez-vous", description: "Partagez votre lien de réservation et commencez à accepter des rendez-vous instantanément." },
    },
  },
  pricing: {
    title: "Tarification simple et transparente",
    subtitle: "Commencez gratuitement pendant 14 jours. Aucune carte de crédit requise.",
    trial: "14 jours d'essai gratuit",
    monthly: "/ mois",
    ctaStart: "Essai gratuit",
    ctaContact: "Contacter les ventes",
    plans: {
      basic: { name: "Basique", description: "Parfait pour les barbiers solo" },
      pro: { name: "Pro", description: "Pour les barbershops en croissance" },
      enterprise: { name: "Entreprise", description: "Pour les grandes opérations" },
    },
  },
  finalCta: {
    title: "Prêt à organiser votre barbershop ?",
    subtitle: "Rejoignez des centaines de barbershops qui utilisent déjà Grid.",
    cta: "Essai gratuit",
    noCreditCard: "Aucune carte de crédit · Annulez à tout moment",
  },
  footer: {
    product: "Produit",
    company: "Entreprise",
    legal: "Légal",
    links: {
      features: "Fonctionnalités",
      pricing: "Tarifs",
      about: "À propos",
      blog: "Blog",
      terms: "Conditions d'utilisation",
      privacy: "Politique de confidentialité",
      contact: "Contact",
    },
    rights: "Tous droits réservés.",
  },
  dashboard: {
    workspace: "Espace de travail",
    title: "Tableau de bord",
    subtitle: "Gérez votre barbershop, votre équipe et vos réservations depuis un espace centralisé.",
    account: "Compte",
    signOut: "Déconnexion",
    loadingTitle: "Chargement du tableau de bord",
    loadingSubtitle: "Préparation de votre espace…",
    cards: {
      overview: { title: "Vue d'ensemble", description: "Consultez vos statistiques de réservation et indicateurs" },
      barbers: { title: "Barbiers", description: "Gérez vos barbiers et leurs profils" },
      services: { title: "Services", description: "Gérez les services et les tarifs" },
      bookings: { title: "Réservations", description: "Consultez et gérez les rendez-vous clients" },
      settings: { title: "Paramètres", description: "Configurez les détails de votre barbershop" },
      billing: { title: "Facturation", description: "Gérez votre abonnement et vos paiements" },
    },
  },
};

export default fr;
