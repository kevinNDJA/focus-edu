/**
 * FOCUS EDU - JavaScript Application
 * Gestion complète de la collecte et analyse des données
 * 
 * Architecture modulaire sans dépendances externes
 * (Chart.js utilisé uniquement pour les graphiques)
 */

// ============================================
// NAMESPACE GLOBAL
// ============================================
const FocusEdu = {};

// Password pour l'accès aux résultats
const RESULTS_PASSWORD = 'Kevin2002';

// ============================================
// MODULE 0 : AUTHENTIFICATION
// ============================================
FocusEdu.Auth = {
    STORAGE_KEY: 'focusEduAuth',
    
    /**
     * Initialise l'authentification
     */
    init() {
        this.attachEventListeners();
        // Do not force the login modal on load; only show it when accessing results
        this.checkAuthStatus();
    },
    
    /**
     * Attache les événements de la form login
     */
    attachEventListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    },
    
    /**
     * Traite la tentative de connexion
     */
    handleLogin() {
        const passwordInput = document.getElementById('login-password');
        const password = passwordInput.value;
        const errorMsg = document.getElementById('login-error');
        
        if (password === RESULTS_PASSWORD) {
            // Authentification réussie
            localStorage.setItem(this.STORAGE_KEY, 'authenticated');
            errorMsg.style.display = 'none';
            this.hideLoginModal();
            // Update UI for authenticated user and show results
            if (FocusEdu.UI && typeof FocusEdu.UI.updateViewForAuth === 'function') {
                FocusEdu.UI.updateViewForAuth(true);
            }
            if (FocusEdu.UI && typeof FocusEdu.UI.navigateTo === 'function') {
                FocusEdu.UI.navigateTo('resultats');
            }
        } else {
            // Mot de passe incorrect
            errorMsg.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
        }
    },
    
    /**
     * Vérifie le statut d'authentification au chargement
     */
    checkAuthStatus() {
        const isAuth = localStorage.getItem(this.STORAGE_KEY) === 'authenticated';
        if (isAuth) {
            this.hideLoginModal();
        } else {
            // Keep modal hidden for public users; only display it on-demand
            this.hideLoginModal();
        }
        // Notify UI to update view based on auth state
        if (window.FocusEdu && FocusEdu.UI && typeof FocusEdu.UI.updateViewForAuth === 'function') {
            FocusEdu.UI.updateViewForAuth(isAuth);
        }
        return isAuth;
    },
    
    /**
     * Affiche la modal de login
     */
    showLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('active');
        }
    },
    
    /**
     * Cache la modal de login
     */
    hideLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('active');
        }
    },
    
    /**
     * Déconnecte l'utilisateur
     */
    logout() {
        localStorage.removeItem(this.STORAGE_KEY);
        location.reload();
    }
};


// ============================================
// MODULE 1 : GESTION DES DONNÉES
// ============================================
FocusEdu.Data = {
    STORAGE_KEY: 'focusEduData',
    
    /**
     * Initialise le stockage s'il n'existe pas
     */
    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ sessions: [] }));
        }
    },

    /**
     * Récupère toutes les sessions stockées
     */
    getAllSessions() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data).sessions : [];
    },

    /**
     * Récupère la dernière session
     */
    getLastSession() {
        const sessions = this.getAllSessions();
        return sessions.length > 0 ? sessions[sessions.length - 1] : null;
    },

    /**
     * Sauvegarde une nouvelle session
     */
    saveSession(session) {
        const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        session.id = this.generateUUID();
        session.timestamp = new Date().toISOString();
        data.sessions.push(session);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        return session;
    },

    /**
     * Supprime toutes les données (après confirmation)
     */
    clearAllData() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ sessions: [] }));
        FocusEdu.UI.showNotification('Toutes les données ont été supprimées.', 'warning');
        setTimeout(() => location.reload(), 1000);
    },

    /**
     * Génère un UUID unique
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
};

// ============================================
// MODULE 2 : QUESTIONS ET VALIDATION
// ============================================
FocusEdu.Questions = {
    
    /**
     * Questions du questionnaire élèves
     */
    getStudentQuestions() {
        return [
            {
                id: 'q1',
                text: 'Je suis capable de me concentrer pendant les cours',
                type: 'likert',
                options: ['Pas du tout', 'Peu', 'Assez', 'Tout à fait']
            },
            {
                id: 'q2',
                text: 'Je me sens distrait(e) par les autres élèves',
                type: 'likert',
                options: ['Jamais', 'Rarement', 'Souvent', 'Toujours'],
                reverse: true // Item négatif - à inverser
            },
            {
                id: 'q3',
                text: 'Les bruits ambiants me gênent pour me concentrer',
                type: 'likert',
                options: ['Pas du tout', 'Peu', 'Assez', 'Beaucoup'],
                reverse: true
            },
            {
                id: 'q4',
                text: 'Je arrive à maintenir mon attention pendant 30 minutes',
                type: 'likert',
                options: ['Non', 'Rarement', 'Souvent', 'Oui']
            },
            {
                id: 'q5',
                text: 'Je prends régulièrement des notes pendant le cours',
                type: 'likert',
                options: ['Jamais', 'Rarement', 'Souvent', 'Toujours']
            },
            {
                id: 'q6',
                text: 'Je suis distrait(e) par mon téléphone ou autre appareil',
                type: 'likert',
                options: ['Jamais', 'Rarement', 'Souvent', 'Très souvent'],
                reverse: true
            },
            {
                id: 'q7',
                text: 'Je comprends les explications du professeur',
                type: 'likert',
                options: ['Rarement', 'Parfois', 'Souvent', 'Toujours']
            },
            {
                id: 'q8',
                text: 'Je pose des questions quand je ne comprends pas',
                type: 'likert',
                options: ['Jamais', 'Rarement', 'Souvent', 'Très souvent']
            },
            {
                id: 'q9',
                text: 'Ma fatigue affecte ma concentration en cours',
                type: 'likert',
                options: ['Pas du tout', 'Un peu', 'Beaucoup', 'Énormément'],
                reverse: true
            },
            {
                id: 'q10',
                text: 'Quel moment de la journée est le plus difficile pour vous ?',
                type: 'choice',
                options: ['Matin', 'Après-midi', 'Indifférent']
            }
        ];
    },

    /**
     * Questions du questionnaire enseignants
     */
    getTeacherQuestions() {
        return [
            {
                id: 'q1',
                text: 'Dans cette classe, le niveau de concentration général est bon',
                type: 'likert',
                options: ['Pas du tout', 'Peu', 'Assez', 'Tout à fait']
            },
            {
                id: 'q2',
                text: 'Je remarque de la distraction chez les élèves',
                type: 'likert',
                options: ['Jamais', 'Rarement', 'Fréquemment', 'Très fréquemment'],
                reverse: true
            },
            {
                id: 'q3',
                text: 'Les élèves utilisent des appareils numériques sans rapport avec le cours',
                type: 'likert',
                options: ['Jamais', 'Rarement', 'Souvent', 'Très souvent'],
                reverse: true
            },
            {
                id: 'q4',
                text: 'La majorité des élèves participe activement au cours',
                type: 'likert',
                options: ['Non', 'Peu', 'Assez', 'Oui']
            },
            {
                id: 'q5',
                text: 'Je dois répéter les consignes régulièrement',
                type: 'likert',
                options: ['Rarement', 'Parfois', 'Souvent', 'Très souvent'],
                reverse: true
            },
            {
                id: 'q6',
                text: 'Les élèves prennent des notes pendant le cours',
                type: 'likert',
                options: ['Très peu', 'Une minorité', 'Une majorité', 'Presque tous']
            },
            {
                id: 'q7',
                text: 'Le bruit dans la classe nuit à la concentration',
                type: 'likert',
                options: ['Pas du tout', 'Peu', 'Assez', 'Énormément'],
                reverse: true
            },
            {
                id: 'q8',
                text: 'La fatigue des élèves est visible en cours',
                type: 'likert',
                options: ['Jamais', 'Rarement', 'Souvent', 'Toujours'],
                reverse: true
            },
            {
                id: 'q9',
                text: 'Quelle période de la journée observe-t-on le moins de concentration ?',
                type: 'choice',
                options: ['Matin', 'Après-midi', 'Indifférent']
            }
        ];
    },

    /**
     * Valide les réponses d'un formulaire
     */
    validateAnswers(formElement, expectedCount) {
        const formData = new FormData(formElement);
        const answers = [];
        let isValid = true;

        // Vérifier que toutes les questions ont une réponse
        formData.forEach((value, key) => {
            if (key !== 'age' && key !== 'sexe' && key !== 'classe' && key !== 'moment') {
                answers.push({ questionId: key, response: value });
            }
        });

        if (answers.length < expectedCount) {
            FocusEdu.UI.showNotification('Veuillez répondre à toutes les questions.', 'error');
            isValid = false;
        }

        return isValid ? answers : null;
    }
};

// ============================================
// MODULE 3 : CALCUL DES SCORES
// ============================================
FocusEdu.Calculator = {
    
    /**
     * Calcule le score de concentration pour un élève
     * Formule : (Σ réponses avec inversion) / 9 / 4 × 100
     */
    calculateStudentScore(answers) {
        // Nouvelle méthode de calcul pour le questionnaire fourni
        // Inputs attendus : answers est un array d'objets { questionId, response }
        // q1: attention (radio) -> 4..1
        // q2: distractions (checkboxes) -> array
        // q3: matières (checkboxes) -> non scoré, informatif
        // q4: influence résultats (radio) -> 4..1
        // q5: stratégies (checkboxes) -> array

        // Récupérer réponses utiles
        const map = {};
        answers.forEach(a => { map[a.questionId] = a.response; });

        const q1 = this._mapLikert(map['q1'], { 'Oui, toujours':4, 'Parfois':3, 'Rarement':2, 'Jamais':1 }) || parseInt(map['q1']) || 1;
        const q4 = this._mapLikert(map['q4'], { 'Oui, beaucoup':4, 'Oui, un peu':3, 'Non':1 }) || parseInt(map['q4']) || 1;

        const q2 = Array.isArray(map['q2']) ? map['q2'] : (map['q2'] ? [map['q2']] : []);
        const q5 = Array.isArray(map['q5']) ? map['q5'] : (map['q5'] ? [map['q5']] : []);

        // Paramètres de pondération (choix justifiables pour mémoire)
        const maxDistractions = 5; // nombre d'items listés
        const maxStrategies = 3; // nombre d'items listés

        const base = (Number(q1) + Number(q4)) / 2; // échelle 1-4

        const penalty = (q2.length / maxDistractions) * 1.0; // réduit la note
        const bonus = (q5.length / maxStrategies) * 1.0; // augmente la note

        let adjusted = base - penalty + bonus;
        if (adjusted < 1) adjusted = 1;
        if (adjusted > 4) adjusted = 4;

        const percentage = (adjusted / 4) * 100;

        return {
            raw: adjusted,
            percentage: Math.round(percentage),
            category: this.classifyScore(percentage)
        };
    },

    /**
     * Help: map provided label to numeric if needed
     */
    _mapLikert(value, map) {
        if (!value) return null;
        if (typeof value === 'string' && map[value] !== undefined) return map[value];
        return null;
    },

    /**
     * Calcule le score de concentration pour un enseignant
     * Même formule mais avec 8 questions Likert (q9 est choice)
     */
    calculateTeacherScore(answers) {
        // Méthode adaptée pour le questionnaire enseignants fourni
        // q1: observation du manque (radio) -> valeur inversée (plus d'observation = moins de concentration)
        // q2: manifestations (checkboxes)
        // q3: causes (checkboxes) -> informatif
        // q4: effets (checkboxes)
        // q5: stratégies (checkboxes)

        const map = {};
        answers.forEach(a => { map[a.questionId] = a.response; });

        // q1 mapping: 'Oui, très souvent' ->1, 'Parfois'->2, 'Rarement'->3, 'Jamais'->4
        const q1 = this._mapLikert(map['q1'], { 'Oui, très souvent':1, 'Parfois':2, 'Rarement':3, 'Jamais':4 }) || parseInt(map['q1']) || 1;

        const q2 = Array.isArray(map['q2']) ? map['q2'] : (map['q2'] ? [map['q2']] : []);
        const q4 = Array.isArray(map['q4']) ? map['q4'] : (map['q4'] ? [map['q4']] : []);
        const q5 = Array.isArray(map['q5']) ? map['q5'] : (map['q5'] ? [map['q5']] : []);

        const maxManifest = 5; // nb approximatif d'items listés
        const maxEffects = 4;
        const maxStrategies = 3;

        const base = Number(q1);
        const penalty = ((q2.length / maxManifest) + (q4.length / maxEffects)) * 0.7; // pondération
        const bonus = (q5.length / maxStrategies) * 1.0;

        let adjusted = base - penalty + bonus;
        if (adjusted < 1) adjusted = 1;
        if (adjusted > 4) adjusted = 4;

        const percentage = (adjusted / 4) * 100;

        return {
            raw: adjusted,
            percentage: Math.round(percentage),
            category: this.classifyScore(percentage)
        };
    },

    /**
     * Classe le score en 3 catégories
     */
    classifyScore(percentage) {
        if (percentage <= 50) {
            return { name: 'Faible concentration', color: '#e74c3c', class: 'low' };
        } else if (percentage <= 75) {
            return { name: 'Concentration moyenne', color: '#f39c12', class: 'medium' };
        } else {
            return { name: 'Bonne concentration', color: '#27ae60', class: 'high' };
        }
    },

    /**
     * Calcule les statistiques agrégées
     */
    calculateAggregateStats(sessions) {
        if (sessions.length === 0) {
            return {
                totalSessions: 0,
                studentSessions: 0,
                teacherSessions: 0,
                averageScore: 0,
                distribution: { low: 0, medium: 0, high: 0 },
                byContext: {}
            };
        }

        let totalScore = 0;
        let studentCount = 0;
        let teacherCount = 0;
        let studentScoreSum = 0;
        let teacherScoreSum = 0;
        const distribution = { low: 0, medium: 0, high: 0 };
        const byMoment = { matin: [], apres_midi: [] };
        const byClass = {};
        const bySex = { M: [], F: [], A: [] };

        sessions.forEach(session => {
            totalScore += session.score;

            // Compter par type
            if (session.context.type === 'eleve') {
                studentCount++;
                studentScoreSum += session.score;

                // Agrégation par contexte
                if (session.context.moment === 'matin') {
                    byMoment.matin.push(session.score);
                } else {
                    byMoment.apres_midi.push(session.score);
                }

                const classe = session.context.classe;
                if (!byClass[classe]) byClass[classe] = [];
                byClass[classe].push(session.score);

                const sexe = session.context.sexe;
                bySex[sexe].push(session.score);
            } else {
                teacherCount++;
                teacherScoreSum += session.score;
            }

            // Distribution
            if (session.category.class === 'low') distribution.low++;
            else if (session.category.class === 'medium') distribution.medium++;
            else distribution.high++;
        });

        return {
            totalSessions: sessions.length,
            studentSessions: studentCount,
            teacherSessions: teacherCount,
            averageScore: Math.round(totalScore / sessions.length),
            averageStudentScore: studentCount > 0 ? Math.round(studentScoreSum / studentCount) : 0,
            averageTeacherScore: teacherCount > 0 ? Math.round(teacherScoreSum / teacherCount) : 0,
            distribution: {
                low: distribution.low,
                medium: distribution.medium,
                high: distribution.high,
                lowPercent: Math.round((distribution.low / sessions.length) * 100),
                mediumPercent: Math.round((distribution.medium / sessions.length) * 100),
                highPercent: Math.round((distribution.high / sessions.length) * 100)
            },
            byMoment: {
                matin: byMoment.matin.length > 0 ? Math.round(byMoment.matin.reduce((a, b) => a + b) / byMoment.matin.length) : 0,
                matinCount: byMoment.matin.length,
                apres_midi: byMoment.apres_midi.length > 0 ? Math.round(byMoment.apres_midi.reduce((a, b) => a + b) / byMoment.apres_midi.length) : 0,
                apres_midiCount: byMoment.apres_midi.length
            },
            byClass: this.calculateAverages(byClass),
            bySex: {
                M: bySex.M.length > 0 ? Math.round(bySex.M.reduce((a, b) => a + b) / bySex.M.length) : 0,
                MCount: bySex.M.length,
                F: bySex.F.length > 0 ? Math.round(bySex.F.reduce((a, b) => a + b) / bySex.F.length) : 0,
                FCount: bySex.F.length,
                A: bySex.A.length > 0 ? Math.round(bySex.A.reduce((a, b) => a + b) / bySex.A.length) : 0,
                ACount: bySex.A.length
            }
        };
    },

    /**
     * Calcule les moyennes pour un objet de listes
     */
    calculateAverages(obj) {
        const result = {};
        for (const key in obj) {
            const values = obj[key];
            result[key] = values.length > 0 ? Math.round(values.reduce((a, b) => a + b) / values.length) : 0;
            result[key + 'Count'] = values.length;
        }
        return result;
    }
};

// ============================================
// MODULE 4 : GESTION DE L'INTERFACE
// ============================================
FocusEdu.UI = {
    charts: {}, // Stockage des instances Chart.js

    /**
     * Initialise les événements de l'interface
     */
    init() {
        this.attachEventListeners();
        this.renderDashboard();
    },

    /**
     * Attache les événements aux éléments
     */
    attachEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.navigateTo(section);
            });
        });

        // Formulaires
        const formEleves = document.getElementById('form-eleves');
        if (formEleves) {
            formEleves.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleStudentSubmit();
            });
        }

        const formEnseignants = document.getElementById('form-enseignants');
        if (formEnseignants) {
            formEnseignants.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleTeacherSubmit();
            });
        }

        // Export CSV
        const btnExport = document.getElementById('btn-export-csv');
        if (btnExport) {
            btnExport.addEventListener('click', () => FocusEdu.Export.downloadCSV());
        }

        // Export PDF (print-focused)
        const btnExportPdf = document.getElementById('btn-export-pdf');
        if (btnExportPdf) {
            btnExportPdf.addEventListener('click', () => FocusEdu.Export.downloadPDF());
        }

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => FocusEdu.Auth.logout());
        }
    },

    /**
     * Met à jour l'interface selon l'état d'authentification
     */
    updateViewForAuth(isAuth) {
        const navEleve = document.querySelector('.nav-btn[data-section="questionnaire-eleves"]');
        const navEnseignant = document.querySelector('.nav-btn[data-section="questionnaire-enseignants"]');
        const navResultats = document.querySelector('.nav-btn[data-section="resultats"]');
        const logoutBtn = document.getElementById('logout-btn');

        if (isAuth) {
            // Admin view: hide public form navs, show results and logout
            if (navEleve) navEleve.classList.add('hidden-nav');
            if (navEnseignant) navEnseignant.classList.add('hidden-nav');
            if (navResultats) navResultats.classList.remove('hidden-nav');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
            // Optionally navigate to results
            // this.navigateTo('resultats');
        } else {
            // Public view: show forms, hide results and logout
            if (navEleve) navEleve.classList.remove('hidden-nav');
            if (navEnseignant) navEnseignant.classList.remove('hidden-nav');
            if (navResultats) navResultats.classList.add('hidden-nav');
            if (logoutBtn) logoutBtn.classList.add('hidden');
        }
    },

    /**
     * Navigue vers une section
     */
    navigateTo(sectionId) {
        // Vérifier l'authentification pour la section résultats
        if (sectionId === 'resultats' && localStorage.getItem(FocusEdu.Auth.STORAGE_KEY) !== 'authenticated') {
            this.showNotification('Accès refusé. Veuillez vous authentifier.', 'error');
            FocusEdu.Auth.showLoginModal();
            return;
        }
        
        // Masquer toutes les sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Afficher la section demandée
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Mettre à jour les boutons de navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === sectionId) {
                btn.classList.add('active');
            }
        });

        // Rafraîchir le dashboard si on accède à Résultats
        if (sectionId === 'resultats') {
            this.renderDashboard();
        }

        // Scroll vers le haut
        window.scrollTo(0, 0);
    },

    /**
     * Traite la soumission du formulaire élèves
     */
    handleStudentSubmit() {
        const form = document.getElementById('form-eleves');
        const formData = new FormData(form);

        // Récupérer nom et prénom
        const nom = formData.get('nom').trim();
        const prenom = formData.get('prenom').trim();

        if (!nom || !prenom) {
            this.showNotification('Veuillez entrer votre nom et prénom.', 'error');
            return;
        }

        // Vérifier les doublons
        const sessions = FocusEdu.Data.getAllSessions();
        const duplicate = sessions.find(s => 
            s.context.type === 'eleve' && 
            s.identity.nom.toLowerCase() === nom.toLowerCase() && 
            s.identity.prenom.toLowerCase() === prenom.toLowerCase()
        );

        if (duplicate) {
            this.showNotification('❌ Vous avez déjà répondu à ce questionnaire. Merci !', 'warning');
            setTimeout(() => this.navigateTo('accueil'), 2000);
            return;
        }


        // Récupérer les variables contextuelles
        const context = {
            type: 'eleve',
            age: formData.get('age'),
            sexe: formData.get('sexe'),
            classe: formData.get('classe'),
            moment: formData.get('moment')
        };

        // Valider les contextes essentiels
        if (!context.age || !context.sexe || !context.classe || !context.moment) {
            this.showNotification('Veuillez remplir toutes les informations contextuelles.', 'error');
            return;
        }

        // Récupérer les réponses présentes dans le formulaire (q1..q5)
        const answers = [];
        const q1 = formData.get('q1');
        const q2 = formData.getAll('q2');
        const q3 = formData.getAll('q3');
        const q4 = formData.get('q4');
        const q5 = formData.getAll('q5');

        if (!q1 || !q4) {
            this.showNotification('Veuillez répondre aux questions requises.', 'error');
            return;
        }

        answers.push({ questionId: 'q1', response: q1 });
        answers.push({ questionId: 'q2', response: q2 });
        answers.push({ questionId: 'q3', response: q3 });
        answers.push({ questionId: 'q4', response: q4 });
        answers.push({ questionId: 'q5', response: q5 });

        // Calculer le score
        const scoreData = FocusEdu.Calculator.calculateStudentScore(answers);

        // Créer la session
        const session = {
            identity: { nom, prenom },
            context: context,
            answers: answers,
            score: scoreData.percentage,
            category: scoreData.category
        };

        // Sauvegarder
        FocusEdu.Data.saveSession(session);

        // Afficher le résultat
        this.showResultModal(scoreData, context);

        // Réinitialiser le formulaire
        form.reset();

        // Naviguer vers les résultats après un délai
        setTimeout(() => this.navigateTo('resultats'), 2000);
    },

    /**
     * Traite la soumission du formulaire enseignants
     */
    handleTeacherSubmit() {
        const form = document.getElementById('form-enseignants');
        const formData = new FormData(form);

        // Récupérer nom et prénom
        const nom = formData.get('nom').trim();
        const prenom = formData.get('prenom').trim();

        if (!nom || !prenom) {
            this.showNotification('Veuillez entrer votre nom et prénom.', 'error');
            return;
        }

        // Vérifier les doublons
        const sessions = FocusEdu.Data.getAllSessions();
        const duplicate = sessions.find(s => 
            s.context.type === 'enseignant' && 
            s.identity.nom.toLowerCase() === nom.toLowerCase() && 
            s.identity.prenom.toLowerCase() === prenom.toLowerCase()
        );

        if (duplicate) {
            this.showNotification('❌ Vous avez déjà répondu à ce questionnaire. Merci !', 'warning');
            setTimeout(() => this.navigateTo('accueil'), 2000);
            return;
        }


        // Récupérer les variables contextuelles
        const context = {
            type: 'enseignant',
            matiere: formData.get('matiere'),
            experience: formData.get('experience'),
            moment: formData.get('moment')
        };

        // Valider le contexte essentiel
        if (!context.matiere || !context.experience || !context.moment) {
            this.showNotification('Veuillez remplir toutes les informations contextuelles (matière, expérience, moment).', 'error');
            return;
        }

        // Récupérer les réponses présentes (q1, q2[], q4[], q5[])
        const answers = [];
        const q1 = formData.get('q1');
        const q2 = formData.getAll('q2');
        const q4 = formData.getAll('q4');
        const q5 = formData.getAll('q5');

        if (!q1) {
            this.showNotification('Veuillez répondre aux questions requises.', 'error');
            return;
        }

        answers.push({ questionId: 'q1', response: q1 });
        answers.push({ questionId: 'q2', response: q2 });
        // q3 can be added if present
        answers.push({ questionId: 'q4', response: q4 });
        answers.push({ questionId: 'q5', response: q5 });

        // Calculer le score
        const scoreData = FocusEdu.Calculator.calculateTeacherScore(answers);

        // Créer la session
        const session = {
            identity: { nom, prenom },
            context: context,
            answers: answers,
            score: scoreData.percentage,
            category: scoreData.category
        };

        // Sauvegarder
        FocusEdu.Data.saveSession(session);

        // Afficher le résultat
        this.showResultModal(scoreData, context);

        // Réinitialiser le formulaire
        form.reset();

        // Naviguer vers les résultats après un délai
        setTimeout(() => this.navigateTo('resultats'), 2000);
    },

    /**
     * Affiche un modal avec le résultat
     */
    showResultModal(scoreData, context) {
        const typeLabel = context.type === 'eleve' ? 'Élève' : 'Enseignant';
        this.showNotification(
            `✓ Résultat enregistré : ${scoreData.percentage}% (${scoreData.category.name})`,
            'success'
        );
    },

    /**
     * Affiche une notification
     */
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.style.display = 'block';
        notification.style.backgroundColor = 
            type === 'error' ? '#e74c3c' : 
            type === 'warning' ? '#f39c12' : '#27ae60';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    },

    /**
     * Rend le tableau de bord des résultats
     */
    renderDashboard() {
        const sessions = FocusEdu.Data.getAllSessions();
        const stats = FocusEdu.Calculator.calculateAggregateStats(sessions);

        // Dernière session
        const lastSession = FocusEdu.Data.getLastSession();
        const lastResultDiv = document.getElementById('dernier-resultat');
        if (lastSession) {
            document.getElementById('score-derniere-session').textContent = lastSession.score;
            document.getElementById('classification-derniere-session').textContent = lastSession.category.name;
            lastResultDiv.style.display = 'block';
        } else {
            lastResultDiv.style.display = 'none';
        }

        // Statistiques globales
        document.getElementById('total-sessions').textContent = stats.totalSessions;
        document.getElementById('score-moyen').textContent = stats.averageScore + '%';
        document.getElementById('sessions-eleves').textContent = stats.studentSessions;
        document.getElementById('sessions-enseignants').textContent = stats.teacherSessions;

        // Afficher/masquer les sections d'analyse
        if (sessions.length > 0) {
            document.getElementById('analyse-contexte').style.display = 
                stats.studentSessions > 0 ? 'block' : 'none';
            document.getElementById('table-container').style.display = 'block';

            // Graphiques
            this.renderCharts(sessions, stats);

            // Table
            this.renderTable(sessions);
        }
    },

    /**
     * Rend les graphiques
     */
    renderCharts(sessions, stats) {
        // Graphique 1 : Distribution
        this.renderDistributionChart(stats);

        // Graphique 2 : Comparaison élèves/enseignants
        if (stats.studentSessions > 0 && stats.teacherSessions > 0) {
            document.getElementById('comparaison-container').style.display = 'block';
            this.renderComparisonChart(stats);
        }

        // Graphiques 3-5 : Variables contextuelles (si données élèves)
        if (stats.studentSessions > 0) {
            this.renderMomentChart(stats);
            this.renderClassChart(stats);
            this.renderSexChart(stats);
        }
    },

    /**
     * Graphique : Distribution des concentrations
     */
    renderDistributionChart(stats) {
        const ctx = document.getElementById('chart-distribution').getContext('2d');
        
        // Détruire le graphique existant
        if (this.charts.distribution) {
            this.charts.distribution.destroy();
        }

        this.charts.distribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Faible', 'Moyenne', 'Bonne'],
                datasets: [{
                    data: [stats.distribution.low, stats.distribution.medium, stats.distribution.high],
                    backgroundColor: ['#e74c3c', '#f39c12', '#27ae60'],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    },

    /**
     * Graphique : Comparaison élèves/enseignants
     */
    renderComparisonChart(stats) {
        const ctx = document.getElementById('chart-comparaison').getContext('2d');
        
        if (this.charts.comparaison) {
            this.charts.comparaison.destroy();
        }

        this.charts.comparaison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Élèves', 'Enseignants'],
                datasets: [{
                    label: 'Score moyen (%)',
                    data: [stats.averageStudentScore, stats.averageTeacherScore],
                    backgroundColor: ['#194682', '#c87832'],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    },

    /**
     * Graphique : Par moment de la journée
     */
    renderMomentChart(stats) {
        const ctx = document.getElementById('chart-moment').getContext('2d');
        
        if (this.charts.moment) {
            this.charts.moment.destroy();
        }

        this.charts.moment = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Matin', 'Après-midi'],
                datasets: [{
                    label: 'Score moyen (%)',
                    data: [stats.byMoment.matin, stats.byMoment.apres_midi],
                    backgroundColor: ['#3498db', '#e74c3c'],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    },

    /**
     * Graphique : Par classe
     */
    renderClassChart(stats) {
        const ctx = document.getElementById('chart-classe').getContext('2d');
        
        if (this.charts.classe) {
            this.charts.classe.destroy();
        }

        const classes = Object.keys(stats.byClass).filter(k => !k.endsWith('Count'));
        const scores = classes.map(c => stats.byClass[c]);

        this.charts.classe = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: classes.map(c => c.replace('eme', 'ème')),
                datasets: [{
                    label: 'Score moyen (%)',
                    data: scores,
                    backgroundColor: '#2a8f7e',
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    },

    /**
     * Graphique : Par sexe
     */
    renderSexChart(stats) {
        const ctx = document.getElementById('chart-sexe').getContext('2d');
        
        if (this.charts.sexe) {
            this.charts.sexe.destroy();
        }

        const labels = [];
        const data = [];
        if (stats.bySex.MCount > 0) {
            labels.push('Masculin');
            data.push(stats.bySex.M);
        }
        if (stats.bySex.FCount > 0) {
            labels.push('Féminin');
            data.push(stats.bySex.F);
        }
        if (stats.bySex.ACount > 0) {
            labels.push('Autre');
            data.push(stats.bySex.A);
        }

        this.charts.sexe = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: ['#3498db', '#e91e63', '#9c27b0'],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    },

    /**
     * Rend la table des sessions
     */
    renderTable(sessions) {
        const tbody = document.querySelector('#sessions-table tbody');
        tbody.innerHTML = '';

        sessions.forEach(session => {
            const row = document.createElement('tr');
            const date = new Date(session.timestamp).toLocaleDateString('fr-FR');
            const type = session.context.type === 'eleve' ? 'Élève' : 'Enseignant';
            const identite = session.identity ? `${session.identity.prenom} ${session.identity.nom}` : 'N/A';
            let contexte = session.context.moment ? session.context.moment : '-';
            if (session.context.classe) {
                contexte += ` | ${session.context.classe}`;
            }

            row.innerHTML = `
                <td>${date}</td>
                <td>${type}</td>
                <td>${identite}</td>
                <td>${contexte}</td>
                <td>${session.score}%</td>
                <td><span style="color: ${session.category.color}; font-weight: 600;">${session.category.name}</span></td>
            `;
            tbody.appendChild(row);
        });
    }
};

// ============================================
// MODULE 5 : EXPORT DES DONNÉES
// ============================================
FocusEdu.Export = {
    
    /**
     * Génère un fichier CSV et le télécharge
     */
    downloadCSV() {
        const sessions = FocusEdu.Data.getAllSessions();
        
        if (sessions.length === 0) {
            FocusEdu.UI.showNotification('Aucune donnée à exporter.', 'warning');
            return;
        }

        const csv = this.generateCSV(sessions);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `focus_edu_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        FocusEdu.UI.showNotification('✓ Export CSV réussi !', 'success');
    },

    /**
     * Prépare l'affichage puis lance l'impression pour produire un PDF
     */
    downloadPDF() {
        // Ensure results view is visible
        if (FocusEdu && FocusEdu.UI && typeof FocusEdu.UI.navigateTo === 'function') {
            FocusEdu.UI.navigateTo('resultats');
        }

        // small delay to allow DOM to render the section
        setTimeout(() => {
            window.print();
        }, 250);
    },

    /**
     * Génère le contenu CSV
     */
    generateCSV(sessions) {
        const headers = [
            'session_id',
            'timestamp',
            'nom',
            'prenom',
            'respondent_type',
            'age',
            'sexe',
            'classe',
            'moment',
            'score',
            'category',
            'q1_response',
            'q2_response',
            'q3_response',
            'q4_response',
            'q5_response',
            'q5_autre'
        ];

        let csv = headers.join(',') + '\n';

        sessions.forEach(session => {
            const row = [
                this.escapeCSV(session.id),
                this.escapeCSV(session.timestamp),
                this.escapeCSV(session.identity ? session.identity.nom : ''),
                this.escapeCSV(session.identity ? session.identity.prenom : ''),
                this.escapeCSV(session.context.type),
                this.escapeCSV(session.context.age || ''),
                this.escapeCSV(session.context.sexe || ''),
                this.escapeCSV(session.context.classe || ''),
                this.escapeCSV(session.context.moment || ''),
                session.score,
                this.escapeCSV(session.category.name),
                ...this.getAnswerValues(session.answers)
            ];
            csv += row.join(',') + '\n';
        });

        return csv;
    },

    /**
     * Récupère les valeurs des réponses dans l'ordre
     */
    getAnswerValues(answers) {
        // Build object map for quick lookup
        const map = {};
        answers.forEach(a => {
            map[a.questionId] = a.response;
        });

        const values = [];
        
        // q1-q5: handle both single values and checkbox arrays
        for (let i = 1; i <= 5; i++) {
            const qid = `q${i}`;
            const response = map[qid];
            let str = '';
            
            if (Array.isArray(response)) {
                str = response.join(';');
            } else if (response) {
                str = String(response);
            }
            
            values.push(this.escapeCSV(str));
        }
        
        // q5_autre: text field (optional, specific to new forms)
        values.push(this.escapeCSV(map['q5_autre'] || ''));
        
        return values;
    },

    /**
     * Échappe les caractères spéciaux pour CSV
     */
    escapeCSV(value) {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    }
};

// ============================================
// INITIALISATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    FocusEdu.Data.init();
    FocusEdu.Auth.init();
    
    // Initialiser l'interface (UI) pour tous — elle s'adapte selon l'auth
    FocusEdu.UI.init();
});
