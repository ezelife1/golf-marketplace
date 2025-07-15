"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useCountry } from './country-context'

export interface LocaleConfig {
  code: string
  name: string
  nativeName: string
  flag: string
  direction: 'ltr' | 'rtl'
}

export const LOCALES: Record<string, LocaleConfig> = {
  'en-GB': {
    code: 'en-GB',
    name: 'English (UK)',
    nativeName: 'English (UK)',
    flag: '🇬🇧',
    direction: 'ltr'
  },
  'en-US': {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English (US)',
    flag: '🇺🇸',
    direction: 'ltr'
  },
  'en-AU': {
    code: 'en-AU',
    name: 'English (AU)',
    nativeName: 'English (Australia)',
    flag: '🇦🇺',
    direction: 'ltr'
  },
  'en-CA': {
    code: 'en-CA',
    name: 'English (CA)',
    nativeName: 'English (Canada)',
    flag: '🇨🇦',
    direction: 'ltr'
  },
  'fr-FR': {
    code: 'fr-FR',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr'
  },
  'de-DE': {
    code: 'de-DE',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr'
  },
  'es-ES': {
    code: 'es-ES',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr'
  },
  'it-IT': {
    code: 'it-IT',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    direction: 'ltr'
  }
}

// Translation keys and default English translations
export const TRANSLATIONS = {
  // Navigation
  'nav.home': 'Home',
  'nav.search': 'Search',
  'nav.sell': 'Sell Equipment',
  'nav.services': 'Services',
  'nav.featured': 'Featured',
  'nav.wanted': 'Wanted',
  'nav.swap': 'Swap',
  'nav.messages': 'Messages',
  'nav.profile': 'Profile',
  'nav.settings': 'Settings',
  'nav.signIn': 'Sign In',
  'nav.signUp': 'Sign Up',
  'nav.signOut': 'Sign Out',

  // Common actions
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.sort': 'Sort',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.submit': 'Submit',
  'common.continue': 'Continue',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.previous': 'Previous',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.viewDetails': 'View Details',
  'common.getStarted': 'Get Started',
  'common.startFreeTrial': 'Start FREE Trial',
  'common.viewAll': 'View All Equipment',
  'common.subscribe': 'Subscribe',

  // Product categories
  'category.drivers': 'Drivers',
  'category.irons': 'Irons',
  'category.putters': 'Putters',
  'category.wedges': 'Wedges',
  'category.fairway-woods': 'Fairway Woods',
  'category.hybrids': 'Hybrids',
  'category.golf-bags': 'Golf Bags',
  'category.apparel': 'Apparel',
  'category.accessories': 'Accessories',
  'category.newEquipment': 'New Equipment',
  'category.usedEquipment': 'Used Equipment',

  // Product conditions
  'condition.new': 'New',
  'condition.like-new': 'Like New',
  'condition.excellent': 'Excellent',
  'condition.very-good': 'Very Good',
  'condition.good': 'Good',
  'condition.fair': 'Fair',

  // Subscription plans
  'plan.free': 'Free',
  'plan.pro': 'Pro',
  'plan.business': 'Business',
  'plan.pga-pro': 'PGA Pro',
  'plan.getStarted': 'Get Started',
  'plan.mostPopular': 'Most Popular',
  'plan.forBusiness': 'For Business',
  'plan.pgaProfessional': 'PGA Professional',

  // Plan features
  'plan.features.commission': 'commission on sales',
  'plan.features.basicListings': 'Basic product listings',
  'plan.features.enhancedListings': 'Enhanced product listings',
  'plan.features.premiumStorefront': 'Premium business storefront',
  'plan.features.communityAccess': 'Community access',
  'plan.features.searchVisibility': 'Standard search visibility',
  'plan.features.priorityPlacement': 'Priority search placement',
  'plan.features.customBranding': 'Custom branding & logos',
  'plan.features.basicMessaging': 'Basic messaging',
  'plan.features.advancedMessaging': 'Advanced messaging tools',
  'plan.features.analytics': 'Sales analytics dashboard',
  'plan.features.comprehensiveAnalytics': 'Comprehensive analytics',
  'plan.features.bulkTools': 'Bulk listing tools',
  'plan.features.emailSupport': 'Email support',
  'plan.features.prioritySupport': 'Priority customer support',
  'plan.features.accountManager': 'Dedicated account manager',
  'plan.features.listingBumps': 'Free listing bumps',
  'plan.features.whiteLabelSolutions': 'White-label solutions',
  'plan.features.pgaBadge': 'Verified PGA Pro badge',
  'plan.features.exclusiveMarketplace': 'Exclusive pro marketplace',
  'plan.features.studentDiscounts': 'Student discount management',
  'plan.features.lessonBooking': 'Lesson booking integration',
  'plan.features.professionalNetworking': 'Professional networking',
  'plan.features.businessAnalytics': 'Advanced business analytics',
  'plan.features.earlyAccess': 'Early access to new equipment',
  'plan.features.professionalBranding': 'Custom professional branding',
  'plan.features.2MonthTrial': 'Start 2-Month FREE Trial',

  // Common plan text
  'plan.perMonth': '/month',

  // Homepage
  'home.hero.badge': '#1 Golf Equipment Marketplace',
  'home.hero.title': 'Elevate Your Golf Game',
  'home.hero.subtitle': 'The premier marketplace for premium golf equipment. Buy, sell, and discover exceptional gear with 50,000+ active golfers.',
  'home.hero.browse': 'Browse Equipment',
  'home.hero.sell': 'Sell Equipment',
  'home.stats.members': 'Active Members',
  'home.stats.listings': 'Items Listed',
  'home.stats.rating': 'User Rating',
  'home.stats.sales': 'In Sales',

  // Features section
  'home.features.title': 'Why Choose ClubUp?',
  'home.features.subtitle': 'Join thousands of golfers buying and selling premium equipment with complete confidence',
  'feature.authentication.title': 'Authenticated Equipment',
  'feature.authentication.description': 'Professional authentication service ensures all premium equipment is genuine and accurately described.',
  'feature.authentication.badge': '£28+ Authentication',
  'feature.community.title': 'Premium Community',
  'feature.community.description': 'Connect with PGA professionals, golf enthusiasts, and equipment experts in our exclusive community.',
  'feature.community.badge': 'PGA Pro Verified',
  'feature.security.title': 'Secure Transactions',
  'feature.security.description': 'Advanced payment protection, seller verification, and buyer guarantees ensure safe transactions.',
  'feature.security.badge': 'Stripe Protected',

  // Membership section
  'home.membership.title': 'Choose Your Membership',
  'home.membership.subtitle': 'Start with a FREE trial • Cancel anytime',

  // Featured products section
  'home.featured.title': 'Featured Equipment',
  'home.featured.subtitle': 'Premium golf equipment from verified sellers',
  'home.featured.authenticated': 'Authenticated',
  'home.featured.featured': 'Featured',
  'home.featured.save': 'Save',

  // Testimonials section
  'home.testimonials.title': 'What Our Members Say',
  'home.testimonials.subtitle': 'Trusted by thousands of golfers worldwide',

  // CTA section
  'home.cta.title': 'Ready to Elevate Your Golf Game?',
  'home.cta.subtitle': 'Join thousands of golfers buying and selling premium equipment. Start with a free trial and experience the ClubUp difference.',
  'home.cta.browse': 'Browse Equipment',
  'home.cta.list': 'List Your Gear',

  // Newsletter section
  'home.newsletter.title': 'Stay Updated',
  'home.newsletter.subtitle': 'Get the latest equipment releases, exclusive deals, and golf tips delivered to your inbox',
  'home.newsletter.placeholder': 'Enter your email',
  'home.newsletter.privacy': 'No spam, unsubscribe anytime. We respect your privacy.',

  // Footer
  'footer.description': 'The premier marketplace for premium golf equipment. Connecting golfers worldwide.',
  'footer.quickLinks': 'Quick Links',
  'footer.support': 'Support',
  'footer.membership': 'Membership',
  'footer.browseEquipment': 'Browse Equipment',
  'footer.sellEquipment': 'Sell Equipment',
  'footer.wantedListings': 'Wanted Listings',
  'footer.services': 'Services',
  'footer.helpCenter': 'Help Center',
  'footer.contactUs': 'Contact Us',
  'footer.termsOfService': 'Terms of Service',
  'footer.privacyPolicy': 'Privacy Policy',
  'footer.joinClubUp': 'Join ClubUp',
  'footer.upgradePlan': 'Upgrade Plan',
  'footer.pgaProfessionals': 'PGA Professionals',
  'footer.businessAccounts': 'Business Accounts',
  'footer.copyright': '© 2025 ClubUp. All rights reserved. The premier golf equipment marketplace.',

  // Testimonials
  'testimonial.sarah.quote': 'Incredible platform! Sold my old driver and found the perfect replacement. The authentication service gave me complete confidence.',
  'testimonial.sarah.name': 'Sarah Johnson',
  'testimonial.sarah.title': 'PGA Pro Member',
  'testimonial.michael.quote': 'The premium community is amazing. Connected with other golf enthusiasts and found some rare vintage clubs I\'d been searching for.',
  'testimonial.michael.name': 'Michael Chen',
  'testimonial.michael.title': 'Business Member',
  'testimonial.david.quote': 'As a teaching professional, the PGA features are invaluable. Student discounts and lesson integration make my business so much easier.',
  'testimonial.david.name': 'David Wilson',
  'testimonial.david.title': 'Teaching Professional',

  // Advertising Platform
  'advertising.title': 'Advertising Platform',
  'advertising.subtitle': 'Reach 50,000+ active golfers with targeted advertising solutions',
  'advertising.banner.title': 'Banner Advertising',
  'advertising.banner.description': 'Premium banner placements across homepage, search results, and product pages',
  'advertising.banner.feature1': 'Homepage banner slots',
  'advertising.banner.feature2': 'Search result placements',
  'advertising.banner.feature3': 'Product page advertising',
  'advertising.featured.title': 'Featured Listings',
  'advertising.featured.description': 'Promote your products with enhanced visibility and premium placement',
  'advertising.featured.feature1': 'Top of search results',
  'advertising.featured.feature2': 'Homepage feature slots',
  'advertising.featured.feature3': 'Category page priority',
  'advertising.newsletter.title': 'Newsletter Sponsorship',
  'advertising.newsletter.description': 'Exclusive sponsorship of our weekly newsletter reaching engaged golfers',
  'advertising.newsletter.feature1': '50,000+ subscribers',
  'advertising.newsletter.feature2': 'Exclusive weekly slot',
  'advertising.newsletter.feature3': 'Performance analytics',
  'advertising.category.title': 'Category Sponsorship',
  'advertising.category.description': 'Become the official partner for specific equipment categories',
  'advertising.category.feature1': 'Category page branding',
  'advertising.category.feature2': 'Official partner status',
  'advertising.category.feature3': 'Enhanced visibility',
  'advertising.pga.title': 'PGA Pro Network',
  'advertising.pga.description': 'Target verified PGA Professionals with exclusive advertising opportunities',
  'advertising.pga.feature1': 'PGA dashboard ads',
  'advertising.pga.feature2': 'Pro marketplace featured',
  'advertising.pga.feature3': 'Educational content sponsor',
  'advertising.custom.title': 'Custom Partnerships',
  'advertising.custom.description': 'Bespoke advertising solutions tailored to your brand and objectives',
  'advertising.custom.feature1': 'Dedicated account manager',
  'advertising.custom.feature2': 'Custom creative solutions',
  'advertising.custom.feature3': 'Performance guarantees',
  'advertising.cta.title': 'Ready to Reach Golf Enthusiasts?',
  'advertising.cta.subtitle': 'Join leading golf brands advertising on ClubUp. Get access to detailed analytics, dedicated support, and proven results.',
  'advertising.cta.mediaKit': 'Get Media Kit',
  'advertising.cta.contactSales': 'Contact Sales Team',

  // Golf associations
  'golf.association.uk': 'PGA Professional',
  'golf.association.us': 'PGA of America Professional',
  'golf.association.au': 'PGA of Australia Professional',
  'golf.association.ca': 'PGA of Canada Professional',
  'golf.association.eu': 'European PGA Professional'
}

// Language-specific translations
const LANGUAGE_TRANSLATIONS: Record<string, Partial<typeof TRANSLATIONS>> = {
  'fr-FR': {
    'nav.home': 'Accueil',
    'nav.search': 'Rechercher',
    'nav.sell': 'Vendre Équipement',
    'nav.services': 'Services',
    'nav.featured': 'En Vedette',
    'nav.wanted': 'Recherché',
    'nav.swap': 'Échange',
    'nav.messages': 'Messages',
    'nav.profile': 'Profil',
    'nav.settings': 'Paramètres',
    'nav.signIn': 'Se Connecter',
    'nav.signUp': 'S\'inscrire',
    'nav.signOut': 'Se Déconnecter',

    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.sort': 'Trier',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.submit': 'Soumettre',
    'common.continue': 'Continuer',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    'common.loading': 'Chargement...',
    'common.viewDetails': 'Voir Détails',
    'common.getStarted': 'Commencer',
    'common.startFreeTrial': 'Commencer l\'Essai GRATUIT',
    'common.viewAll': 'Voir Tout l\'Équipement',
    'common.subscribe': 'S\'abonner',

    'category.drivers': 'Drivers',
    'category.irons': 'Fers',
    'category.putters': 'Putters',
    'category.wedges': 'Wedges',
    'category.fairway-woods': 'Bois de Parcours',
    'category.hybrids': 'Hybrides',
    'category.golf-bags': 'Sacs de Golf',
    'category.apparel': 'Vêtements',
    'category.accessories': 'Accessoires',
    'category.newEquipment': 'Nouvel Équipement',
    'category.usedEquipment': 'Équipement Usagé',

    'condition.new': 'Neuf',
    'condition.like-new': 'Comme Neuf',
    'condition.excellent': 'Excellent',
    'condition.very-good': 'Très Bon',
    'condition.good': 'Bon',
    'condition.fair': 'Correct',

    'plan.free': 'Gratuit',
    'plan.pro': 'Pro',
    'plan.business': 'Entreprise',
    'plan.pga-pro': 'PGA Pro',
    'plan.getStarted': 'Commencer',
    'plan.mostPopular': 'Plus Populaire',
    'plan.forBusiness': 'Pour Entreprise',
    'plan.pgaProfessional': 'Professionnel PGA',
    'plan.perMonth': '/mois',

    // Plan features in French
    'plan.features.commission': 'commission sur les ventes',
    'plan.features.basicListings': 'Annonces de produits de base',
    'plan.features.enhancedListings': 'Annonces de produits améliorées',
    'plan.features.premiumStorefront': 'Vitrine d\'entreprise premium',
    'plan.features.communityAccess': 'Accès à la communauté',
    'plan.features.searchVisibility': 'Visibilité de recherche standard',
    'plan.features.priorityPlacement': 'Placement prioritaire dans la recherche',
    'plan.features.customBranding': 'Image de marque et logos personnalisés',
    'plan.features.basicMessaging': 'Messagerie de base',
    'plan.features.advancedMessaging': 'Outils de messagerie avancés',
    'plan.features.analytics': 'Tableau de bord analytique des ventes',
    'plan.features.comprehensiveAnalytics': 'Analyses complètes',
    'plan.features.bulkTools': 'Outils de liste en lot',
    'plan.features.emailSupport': 'Support par email',
    'plan.features.prioritySupport': 'Support client prioritaire',
    'plan.features.accountManager': 'Gestionnaire de compte dédié',
    'plan.features.listingBumps': 'Remontées d\'annonces gratuites',
    'plan.features.whiteLabelSolutions': 'Solutions en marque blanche',
    'plan.features.pgaBadge': 'Badge PGA Pro vérifié',
    'plan.features.exclusiveMarketplace': 'Marché professionnel exclusif',
    'plan.features.studentDiscounts': 'Gestion des remises étudiantes',
    'plan.features.lessonBooking': 'Intégration de réservation de leçons',
    'plan.features.professionalNetworking': 'Réseautage professionnel',
    'plan.features.businessAnalytics': 'Analyses d\'affaires avancées',
    'plan.features.earlyAccess': 'Accès anticipé aux nouveaux équipements',
    'plan.features.professionalBranding': 'Image de marque professionnelle personnalisée',
    'plan.features.2MonthTrial': 'Commencer l\'Essai GRATUIT de 2 Mois',

    'home.hero.badge': 'Marketplace d\'Équipement de Golf #1',
    'home.hero.title': 'Élevez Votre Jeu de Golf',
    'home.hero.subtitle': 'La place de marché premium pour l\'équipement de golf haut de gamme. Achetez, vendez et découvrez du matériel exceptionnel avec plus de 50 000 golfeurs actifs.',
    'home.hero.browse': 'Parcourir l\'Équipement',
    'home.hero.sell': 'Vendre l\'Équipement',
    'home.stats.members': 'Membres Actifs',
    'home.stats.listings': 'Articles Listés',
    'home.stats.rating': 'Note Utilisateur',
    'home.stats.sales': 'En Ventes',

    'home.features.title': 'Pourquoi Choisir ClubUp?',
    'home.features.subtitle': 'Rejoignez des milliers de golfeurs qui achètent et vendent de l\'équipement premium en toute confiance',
    'feature.authentication.title': 'Équipement Authentifié',
    'feature.authentication.description': 'Le service d\'authentification professionnel garantit que tout équipement premium est authentique et décrit avec précision.',
    'feature.community.title': 'Communauté Premium',
    'feature.community.description': 'Connectez-vous avec des professionnels PGA, des passionnés de golf et des experts en équipement dans notre communauté exclusive.',
    'feature.security.title': 'Transactions Sécurisées',
    'feature.security.description': 'Protection de paiement avancée, vérification des vendeurs et garanties acheteur pour des transactions sûres.',

    'home.membership.title': 'Choisissez Votre Adhésion',
    'home.membership.subtitle': 'Commencez avec un essai GRATUIT • Annulez à tout moment',

    'home.featured.title': 'Équipement En Vedette',
    'home.featured.subtitle': 'Équipement de golf premium de vendeurs vérifiés',
    'home.featured.authenticated': 'Authentifié',
    'home.featured.featured': 'En Vedette',

    'home.testimonials.title': 'Ce Que Disent Nos Membres',
    'home.testimonials.subtitle': 'Fait confiance par des milliers de golfeurs dans le monde',

    'home.cta.title': 'Prêt à Élever Votre Jeu de Golf?',
    'home.cta.subtitle': 'Rejoignez des milliers de golfeurs qui achètent et vendent de l\'équipement premium. Commencez avec un essai gratuit et découvrez la différence ClubUp.',

    'home.newsletter.title': 'Restez Informé',
    'home.newsletter.subtitle': 'Recevez les dernières sorties d\'équipement, offres exclusives et conseils de golf dans votre boîte mail',
    'home.newsletter.placeholder': 'Entrez votre email',
    'home.newsletter.privacy': 'Pas de spam, désabonnez-vous à tout moment. Nous respectons votre vie privée.',

    // Testimonials
    'testimonial.sarah.quote': 'Plateforme incroyable! J\'ai vendu mon ancien driver et trouvé le remplacement parfait. Le service d\'authentification m\'a donné une confiance totale.',
    'testimonial.sarah.name': 'Sarah Johnson',
    'testimonial.sarah.title': 'Membre Pro PGA',
    'testimonial.michael.quote': 'La communauté premium est fantastique. J\'ai connecté avec d\'autres passionnés de golf et trouvé des clubs vintage rares que je cherchais.',
    'testimonial.michael.name': 'Michael Chen',
    'testimonial.michael.title': 'Membre Entreprise',
    'testimonial.david.quote': 'En tant que professionnel enseignant, les fonctionnalités PGA sont inestimables. Les remises étudiants et l\'intégration des leçons facilitent beaucoup mon business.',
    'testimonial.david.name': 'David Wilson',
    'testimonial.david.title': 'Professionnel Enseignant',

    // Advertising Platform
    'advertising.title': 'Plateforme Publicitaire',
    'advertising.subtitle': 'Atteignez plus de 50 000 golfeurs actifs avec des solutions publicitaires ciblées',
    'advertising.banner.title': 'Publicité Bannière',
    'advertising.banner.description': 'Placements de bannières premium sur la page d\'accueil, les résultats de recherche et les pages de produits',
    'advertising.featured.title': 'Annonces En Vedette',
    'advertising.featured.description': 'Promouvez vos produits avec une visibilité améliorée et un placement premium',
    'advertising.newsletter.title': 'Parrainage Newsletter',
    'advertising.newsletter.description': 'Parrainage exclusif de notre newsletter hebdomadaire atteignant des golfeurs engagés',
    'advertising.category.title': 'Parrainage de Catégorie',
    'advertising.category.description': 'Devenez le partenaire officiel pour des catégories d\'équipement spécifiques',
    'advertising.pga.title': 'Réseau PGA Pro',
    'advertising.pga.description': 'Ciblez les professionnels PGA vérifiés avec des opportunités publicitaires exclusives',
    'advertising.custom.title': 'Partenariats Personnalisés',
    'advertising.custom.description': 'Solutions publicitaires sur mesure adaptées à votre marque et vos objectifs',
    'advertising.cta.title': 'Prêt à Atteindre les Passionnés de Golf?',
    'advertising.cta.subtitle': 'Rejoignez les grandes marques de golf qui font de la publicité sur ClubUp. Accédez à des analyses détaillées, un support dédié et des résultats prouvés.',
    'advertising.cta.mediaKit': 'Obtenir le Kit Média',
    'advertising.cta.contactSales': 'Contacter l\'Équipe Commerciale',

    'footer.description': 'La place de marché premium pour l\'équipement de golf haut de gamme. Connectant les golfeurs du monde entier.',
    'footer.quickLinks': 'Liens Rapides',
    'footer.support': 'Support',
    'footer.membership': 'Adhésion'
  },

  'de-DE': {
    'nav.home': 'Startseite',
    'nav.search': 'Suchen',
    'nav.sell': 'Ausrüstung Verkaufen',
    'nav.services': 'Dienstleistungen',
    'nav.featured': 'Empfohlen',
    'nav.wanted': 'Gesucht',
    'nav.swap': 'Tauschen',
    'nav.messages': 'Nachrichten',
    'nav.profile': 'Profil',
    'nav.settings': 'Einstellungen',
    'nav.signIn': 'Anmelden',
    'nav.signUp': 'Registrieren',
    'nav.signOut': 'Abmelden',

    'common.search': 'Suchen',
    'common.filter': 'Filtern',
    'common.sort': 'Sortieren',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.viewDetails': 'Details Anzeigen',
    'common.getStarted': 'Loslegen',
    'common.startFreeTrial': 'KOSTENLOSE Testversion Starten',
    'common.viewAll': 'Alle Ausrüstung Anzeigen',

    'category.drivers': 'Driver',
    'category.irons': 'Eisen',
    'category.putters': 'Putter',
    'category.wedges': 'Wedges',
    'category.fairway-woods': 'Fairwayhölzer',
    'category.hybrids': 'Hybride',
    'category.golf-bags': 'Golftaschen',
    'category.apparel': 'Kleidung',
    'category.accessories': 'Zubehör',

    'condition.new': 'Neu',
    'condition.excellent': 'Ausgezeichnet',
    'condition.very-good': 'Sehr Gut',
    'condition.good': 'Gut',

    'plan.free': 'Kostenlos',
    'plan.pro': 'Pro',
    'plan.business': 'Unternehmen',
    'plan.pga-pro': 'PGA Pro',
    'plan.getStarted': 'Loslegen',
    'plan.mostPopular': 'Am Beliebtesten',
    'plan.forBusiness': 'Für Unternehmen',
    'plan.pgaProfessional': 'PGA Professionell',
    'plan.perMonth': '/Monat',

    // Plan features in German
    'plan.features.commission': 'Provision auf Verkäufe',
    'plan.features.basicListings': 'Grundlegende Produktanzeigen',
    'plan.features.enhancedListings': 'Erweiterte Produktanzeigen',
    'plan.features.premiumStorefront': 'Premium-Geschäfts-Storefront',
    'plan.features.communityAccess': 'Community-Zugang',
    'plan.features.searchVisibility': 'Standard-Suchsichtbarkeit',
    'plan.features.priorityPlacement': 'Prioritäts-Suchplatzierung',
    'plan.features.customBranding': 'Individuelles Branding & Logos',
    'plan.features.basicMessaging': 'Basis-Messaging',
    'plan.features.advancedMessaging': 'Erweiterte Messaging-Tools',
    'plan.features.analytics': 'Verkaufs-Analytics-Dashboard',
    'plan.features.comprehensiveAnalytics': 'Umfassende Analysen',
    'plan.features.bulkTools': 'Bulk-Listing-Tools',
    'plan.features.emailSupport': 'Email-Support',
    'plan.features.prioritySupport': 'Prioritäts-Kundensupport',
    'plan.features.accountManager': 'Dedizierter Account Manager',
    'plan.features.listingBumps': 'Kostenlose Listing-Boosts',
    'plan.features.whiteLabelSolutions': 'White-Label-Lösungen',
    'plan.features.pgaBadge': 'Verifiziertes PGA Pro Abzeichen',
    'plan.features.exclusiveMarketplace': 'Exklusiver Pro-Marktplatz',
    'plan.features.studentDiscounts': 'Studentenrabatt-Management',
    'plan.features.lessonBooking': 'Unterrichtsbuchungs-Integration',
    'plan.features.professionalNetworking': 'Professionelles Networking',
    'plan.features.businessAnalytics': 'Erweiterte Business-Analysen',
    'plan.features.earlyAccess': 'Früher Zugang zu neuer Ausrüstung',
    'plan.features.professionalBranding': 'Individuelles professionelles Branding',
    'plan.features.2MonthTrial': '2-Monats KOSTENLOSE Testversion Starten',

    'home.hero.title': 'Verbessern Sie Ihr Golfspiel',
    'home.hero.subtitle': 'Der erstklassige Marktplatz für Premium-Golfausrüstung. Kaufen, verkaufen und entdecken Sie außergewöhnliche Ausrüstung mit über 50.000 aktiven Golfern.',
    'home.hero.browse': 'Ausrüstung Durchsuchen',
    'home.hero.sell': 'Ausrüstung Verkaufen',
    'home.stats.members': 'Aktive Mitglieder',
    'home.stats.listings': 'Gelistete Artikel',
    'home.stats.sales': 'Im Verkauf',

    'home.features.title': 'Warum ClubUp Wählen?',
    'feature.authentication.title': 'Authentifizierte Ausrüstung',
    'feature.community.title': 'Premium-Gemeinschaft',
    'feature.security.title': 'Sichere Transaktionen',

    'home.membership.title': 'Wählen Sie Ihre Mitgliedschaft',
    'home.featured.title': 'Empfohlene Ausrüstung',
    'home.testimonials.title': 'Was Unsere Mitglieder Sagen',
    'home.newsletter.title': 'Bleiben Sie Auf Dem Laufenden',

    // Testimonials
    'testimonial.sarah.quote': 'Unglaubliche Plattform! Verkaufte meinen alten Driver und fand den perfekten Ersatz. Der Authentifizierungsservice gab mir vollstes Vertrauen.',
    'testimonial.sarah.name': 'Sarah Johnson',
    'testimonial.sarah.title': 'PGA Pro Mitglied',
    'testimonial.michael.quote': 'Die Premium-Community ist fantastisch. Vernetzte mich mit anderen Golf-Enthusiasten und fand seltene Vintage-Schläger, nach denen ich gesucht hatte.',
    'testimonial.michael.name': 'Michael Chen',
    'testimonial.michael.title': 'Business Mitglied',
    'testimonial.david.quote': 'Als Lehrprofi sind die PGA-Features unschätzbar. Studentenrabatte und Unterrichtsintegration machen mein Geschäft viel einfacher.',
    'testimonial.david.name': 'David Wilson',
    'testimonial.david.title': 'Lehrprofi',

    // Advertising Platform
    'advertising.title': 'Werbeplattform',
    'advertising.subtitle': 'Erreichen Sie über 50.000 aktive Golfer mit gezielten Werbelösungen',
    'advertising.banner.title': 'Banner-Werbung',
    'advertising.banner.description': 'Premium-Banner-Platzierungen auf Homepage, Suchergebnissen und Produktseiten',
    'advertising.featured.title': 'Empfohlene Anzeigen',
    'advertising.featured.description': 'Bewerben Sie Ihre Produkte mit verbesserter Sichtbarkeit und Premium-Platzierung',
    'advertising.newsletter.title': 'Newsletter-Sponsoring',
    'advertising.newsletter.description': 'Exklusives Sponsoring unseres wöchentlichen Newsletters für engagierte Golfer',
    'advertising.category.title': 'Kategorie-Sponsoring',
    'advertising.category.description': 'Werden Sie offizieller Partner für spezifische Ausrüstungskategorien',
    'advertising.pga.title': 'PGA Pro Netzwerk',
    'advertising.pga.description': 'Zielen Sie auf verifizierte PGA-Profis mit exklusiven Werbemöglichkeiten',
    'advertising.custom.title': 'Individuelle Partnerschaften',
    'advertising.custom.description': 'Maßgeschneiderte Werbelösungen für Ihre Marke und Ziele',
    'advertising.cta.title': 'Bereit, Golf-Enthusiasten zu Erreichen?',
    'advertising.cta.subtitle': 'Schließen Sie sich führenden Golf-Marken an, die auf ClubUp werben. Erhalten Sie Zugang zu detaillierten Analysen, dediziertem Support und bewährten Ergebnissen.',
    'advertising.cta.mediaKit': 'Media-Kit Erhalten',
    'advertising.cta.contactSales': 'Vertriebsteam Kontaktieren'
  },

  'es-ES': {
    'nav.home': 'Inicio',
    'nav.search': 'Buscar',
    'nav.sell': 'Vender Equipo',
    'nav.services': 'Servicios',
    'nav.featured': 'Destacado',
    'nav.wanted': 'Buscado',
    'nav.messages': 'Mensajes',
    'nav.profile': 'Perfil',

    'common.search': 'Buscar',
    'common.viewDetails': 'Ver Detalles',
    'common.getStarted': 'Empezar',
    'common.startFreeTrial': 'Iniciar Prueba GRATUITA',

    'category.drivers': 'Drivers',
    'category.irons': 'Hierros',
    'category.putters': 'Putters',
    'category.golf-bags': 'Bolsas de Golf',
    'category.accessories': 'Accesorios',

    'condition.new': 'Nuevo',
    'condition.excellent': 'Excelente',
    'condition.good': 'Bueno',

    'plan.free': 'Gratis',
    'plan.pro': 'Pro',
    'plan.business': 'Empresa',
    'plan.pga-pro': 'PGA Pro',
    'plan.getStarted': 'Empezar',
    'plan.mostPopular': 'Más Popular',
    'plan.forBusiness': 'Para Empresa',
    'plan.pgaProfessional': 'Profesional PGA',
    'plan.perMonth': '/mes',

    // Plan features in Spanish
    'plan.features.commission': 'comisión en ventas',
    'plan.features.basicListings': 'Anuncios básicos de productos',
    'plan.features.enhancedListings': 'Anuncios mejorados de productos',
    'plan.features.premiumStorefront': 'Escaparate empresarial premium',
    'plan.features.communityAccess': 'Acceso a la comunidad',
    'plan.features.searchVisibility': 'Visibilidad de búsqueda estándar',
    'plan.features.priorityPlacement': 'Ubicación prioritaria en búsqueda',
    'plan.features.customBranding': 'Marca personalizada y logos',
    'plan.features.basicMessaging': 'Mensajería básica',
    'plan.features.advancedMessaging': 'Herramientas de mensajería avanzadas',
    'plan.features.analytics': 'Panel de análisis de ventas',
    'plan.features.comprehensiveAnalytics': 'Análisis integral',
    'plan.features.bulkTools': 'Herramientas de listado masivo',
    'plan.features.emailSupport': 'Soporte por email',
    'plan.features.prioritySupport': 'Soporte al cliente prioritario',
    'plan.features.accountManager': 'Gerente de cuenta dedicado',
    'plan.features.listingBumps': 'Impulsos de listado gratuitos',
    'plan.features.whiteLabelSolutions': 'Soluciones de marca blanca',
    'plan.features.pgaBadge': 'Insignia PGA Pro verificada',
    'plan.features.exclusiveMarketplace': 'Mercado profesional exclusivo',
    'plan.features.studentDiscounts': 'Gestión de descuentos estudiantiles',
    'plan.features.lessonBooking': 'Integración de reserva de lecciones',
    'plan.features.professionalNetworking': 'Networking profesional',
    'plan.features.businessAnalytics': 'Análisis empresarial avanzado',
    'plan.features.earlyAccess': 'Acceso temprano a nuevo equipamiento',
    'plan.features.professionalBranding': 'Marca profesional personalizada',
    'plan.features.2MonthTrial': 'Iniciar Prueba GRATUITA de 2 Meses',

    'home.hero.title': 'Eleva Tu Juego de Golf',
    'home.hero.subtitle': 'El mercado premium para equipos de golf de alta calidad. Compra, vende y descubre equipos excepcionales con más de 50,000 golfistas activos.',
    'home.hero.browse': 'Explorar Equipo',
    'home.hero.sell': 'Vender Equipo',
    'home.stats.members': 'Miembros Activos',
    'home.stats.listings': 'Artículos Listados',
    'home.stats.sales': 'En Ventas',

    'home.features.title': '¿Por Qué Elegir ClubUp?',
    'feature.authentication.title': 'Equipo Autenticado',
    'feature.community.title': 'Comunidad Premium',
    'feature.security.title': 'Transacciones Seguras',

    'home.membership.title': 'Elige Tu Membresía',
    'home.featured.title': 'Equipo Destacado',
    'home.testimonials.title': 'Lo Que Dicen Nuestros Miembros',

    // Testimonials
    'testimonial.sarah.quote': '¡Plataforma increíble! Vendí mi driver viejo y encontré el reemplazo perfecto. El servicio de autenticación me dio completa confianza.',
    'testimonial.sarah.name': 'Sarah Johnson',
    'testimonial.sarah.title': 'Miembro PGA Pro',
    'testimonial.michael.quote': 'La comunidad premium es fantástica. Me conecté con otros entusiastas del golf y encontré algunos palos vintage raros que había estado buscando.',
    'testimonial.michael.name': 'Michael Chen',
    'testimonial.michael.title': 'Miembro Business',
    'testimonial.david.quote': 'Como profesional de enseñanza, las características PGA son invaluables. Los descuentos estudiantiles y la integración de lecciones hacen mi negocio mucho más fácil.',
    'testimonial.david.name': 'David Wilson',
    'testimonial.david.title': 'Profesional de Enseñanza',

    // Advertising Platform
    'advertising.title': 'Plataforma Publicitaria',
    'advertising.subtitle': 'Alcanza más de 50,000 golfistas activos con soluciones publicitarias dirigidas',
    'advertising.banner.title': 'Publicidad de Banner',
    'advertising.banner.description': 'Colocaciones premium de banners en página de inicio, resultados de búsqueda y páginas de productos',
    'advertising.featured.title': 'Anuncios Destacados',
    'advertising.featured.description': 'Promueve tus productos con visibilidad mejorada y colocación premium',
    'advertising.newsletter.title': 'Patrocinio de Newsletter',
    'advertising.newsletter.description': 'Patrocinio exclusivo de nuestro newsletter semanal llegando a golfistas comprometidos',
    'advertising.category.title': 'Patrocinio de Categoría',
    'advertising.category.description': 'Conviértete en el socio oficial para categorías específicas de equipamiento',
    'advertising.pga.title': 'Red PGA Pro',
    'advertising.pga.description': 'Dirige a profesionales PGA verificados con oportunidades publicitarias exclusivas',
    'advertising.custom.title': 'Asociaciones Personalizadas',
    'advertising.custom.description': 'Soluciones publicitarias personalizadas adaptadas a tu marca y objetivos',
    'advertising.cta.title': '¿Listo para Alcanzar Entusiastas del Golf?',
    'advertising.cta.subtitle': 'Únete a las marcas líderes de golf que anuncian en ClubUp. Obtén acceso a análisis detallados, soporte dedicado y resultados probados.',
    'advertising.cta.mediaKit': 'Obtener Kit de Medios',
    'advertising.cta.contactSales': 'Contactar Equipo de Ventas'
  }
}

interface LocaleContextType {
  locale: LocaleConfig
  setLocale: (localeCode: string) => void
  t: (key: string, fallback?: string) => string
  formatDate: (date: Date) => string
  formatTime: (date: Date) => string
  formatDateTime: (date: Date) => string
  formatRelativeTime: (date: Date) => string
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

interface LocaleProviderProps {
  children: ReactNode
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const { country } = useCountry()
  const [locale, setLocaleState] = useState<LocaleConfig>(LOCALES['en-GB'])

  useEffect(() => {
    // Set locale based on country
    const countryLocaleMap: Record<string, string> = {
      GB: 'en-GB',
      US: 'en-US',
      AU: 'en-AU',
      CA: 'en-CA',
      EU: 'en-GB' // Default for EU
    }

    const savedLocale = localStorage.getItem('clubup-locale')
    if (savedLocale && LOCALES[savedLocale]) {
      setLocaleState(LOCALES[savedLocale])
    } else if (countryLocaleMap[country.code]) {
      setLocaleState(LOCALES[countryLocaleMap[country.code]])
    }
  }, [country])

  const setLocale = (localeCode: string) => {
    if (LOCALES[localeCode]) {
      setLocaleState(LOCALES[localeCode])
      localStorage.setItem('clubup-locale', localeCode)
    }
  }

  const t = (key: string, fallback?: string): string => {
    const languageTranslations = LANGUAGE_TRANSLATIONS[locale.code] || {}
    return languageTranslations[key as keyof typeof TRANSLATIONS] ||
           TRANSLATIONS[key as keyof typeof TRANSLATIONS] ||
           fallback ||
           key
  }

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(locale.code, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat(locale.code, {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatDateTime = (date: Date): string => {
    return new Intl.DateTimeFormat(locale.code, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatRelativeTime = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return t('time.now', 'Just now')
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays} days ago`
    }

    return formatDate(date)
  }

  const value = {
    locale,
    setLocale,
    t,
    formatDate,
    formatTime,
    formatDateTime,
    formatRelativeTime
  }

  return (
    <LocaleContext.Provider value={value}>
      <div dir={locale.direction}>
        {children}
      </div>
    </LocaleContext.Provider>
  )
}

export const useLocale = () => {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
