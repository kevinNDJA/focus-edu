// Questionnaires mise à jour - extrait pour référence
// Mettre à jour FocusEdu.Questions.getStudentQuestions() :

getStudentQuestions() {
    return [
        {
            id: 'q1',
            text: 'Arrivez-vous facilement à rester attentif pendant les cours ?',
            type: 'radio',
            options: ['Oui, toujours', 'Parfois', 'Rarement', 'Jamais']
        },
        {
            id: 'q2',
            text: 'Quelles sont les principales distractions qui vous empêchent de vous concentrer ?',
            type: 'checkbox',
            options: ['Téléphone portable / réseaux sociaux', 'Discussions avec camarades', 'Bruit dans la classe', 'Fatigue / manque de sommeil'],
            hasOther: true
        },
        {
            id: 'q3',
            text: 'Dans quelles matières avez-vous le plus de difficultés à rester concentré ?',
            type: 'checkbox',
            options: ['Mathématiques', 'Français', 'Sciences', 'Histoire-Géographie'],
            hasOther: true
        },
        {
            id: 'q4',
            text: 'Pensez-vous que votre manque de concentration influence vos résultats scolaires ?',
            type: 'radio',
            options: ['Oui, beaucoup', 'Oui, un peu', 'Non']
        },
        {
            id: 'q5',
            text: 'Quelles stratégies utilisez-vous pour améliorer votre concentration ?',
            type: 'checkbox',
            options: ['Prendre des notes', 'Éviter les distractions', 'Demander de l\'aide à l\'enseignant'],
            hasOther: true
        }
    ];
}

// Mettre à jour FocusEdu.Questions.getTeacherQuestions() :

getTeacherQuestions() {
    return [
        {
            id: 'q1',
            text: 'Observez-vous souvent un manque de concentration chez vos élèves ?',
            type: 'radio',
            options: ['Oui, très souvent', 'Parfois', 'Rarement', 'Jamais']
        },
        {
            id: 'q2',
            text: 'Quelles manifestations du manque de concentration remarquez-vous le plus ?',
            type: 'checkbox',
            options: ['Inattention aux explications', 'Bavardages', 'Utilisation du téléphone en classe', 'Fatigue / somnolence'],
            hasOther: true
        },
        {
            id: 'q3',
            text: 'Selon vous, quelles sont les principales causes de la dispersion cognitive des élèves ?',
            type: 'checkbox',
            options: ['Méthodes pédagogiques inadaptées', 'Conditions socio-économiques', 'Influence des technologies', 'Environnement scolaire (bruit, discipline)'],
            hasOther: true
        },
        {
            id: 'q4',
            text: 'Comment le manque de concentration affecte-t-il vos cours ?',
            type: 'checkbox',
            options: ['Perturbe le déroulement des leçons', 'Diminue la participation des élèves', 'Réduit la qualité des apprentissages'],
            hasOther: true
        },
        {
            id: 'q5',
            text: 'Quelles stratégies utilisez-vous pour maintenir l\'attention des élèves ?',
            type: 'checkbox',
            options: ['Varier les méthodes pédagogiques', 'Encourager la participation active', 'Réduire les distractions en classe'],
            hasOther: true
        },
        {
            id: 'q6',
            text: 'Quelles recommandations feriez-vous pour améliorer la concentration des élèves au CEG Boou ?',
            type: 'text',
            placeholder: 'Réponse libre'
        }
    ];
}
