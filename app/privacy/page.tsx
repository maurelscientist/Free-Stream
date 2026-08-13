import BackButton from '../components/BackButton'

export default function PrivacyPage() {
  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton />
        <h1 className="text-2xl font-semibold">Politique de confidentialité — Free Stream</h1>
      <p className="mt-2 text-sm text-slate-600"><strong>Dernière mise à jour :</strong> 10 août 2026</p>

      <section className="mt-6 space-y-4 text-sm text-slate-700">
        <p>
          La présente Politique de confidentialité explique comment <strong>DataFlow</strong>, éditeur du site
          <strong> Free Stream</strong>, collecte, utilise, conserve et protège les informations des utilisateurs du service.
        </p>

        <p>En utilisant Free Stream, l’utilisateur reconnaît avoir pris connaissance de la présente politique.</p>

        <h2 className="mt-4 font-semibold">1. Responsable du traitement</h2>
        <p>
          Le responsable du traitement des données collectées via Free Stream est :
        </p>
        <p>
          <strong>DataFlow</strong>
        </p>
        <p>- E-mail : contactbeepai@gmail.com</p>
        <p>- Site : Free Stream</p>

        <h2 className="mt-4 font-semibold">2. Données collectées</h2>
        <p>Free Stream limite la collecte de données aux informations nécessaires au fonctionnement du service.</p>

        <h3 className="mt-2 font-medium">2.1. Connexion avec Google</h3>
        <p>
          Pour accéder à certaines fonctionnalités, notamment l’espace <em>Favoris</em>, l’utilisateur peut se connecter à
          Free Stream à l’aide de son compte Google. Lors de cette connexion, Free Stream peut recevoir de Google certaines
          informations associées au compte : nom, adresse e-mail, photo de profil et identifiant unique. Free Stream ne demande
          pas le mot de passe Google de l’utilisateur.
        </p>

        <h2 className="mt-4 font-semibold">3. Utilisation des données</h2>
        <p>Les données collectées sont utilisées uniquement dans le cadre du fonctionnement de Free Stream, notamment afin de :</p>
        <ul className="list-disc pl-6">
          <li>permettre l’authentification de l’utilisateur ;</li>
          <li>créer et gérer son compte Free Stream ;</li>
          <li>permettre l’accès à son espace personnel ;</li>
          <li>sauvegarder et afficher ses chaînes favorites ;</li>
          <li>synchroniser ses favoris entre ses appareils ;</li>
          <li>sécuriser le compte et prévenir les utilisations abusives ;</li>
          <li>assurer le fonctionnement général du service.</li>
        </ul>
        <p><strong>DataFlow ne vend pas les données personnelles des utilisateurs.</strong></p>

        <h2 className="mt-4 font-semibold">4. Gestion des favoris</h2>
        <p>
          Lorsqu’un utilisateur connecté ajoute une chaîne à ses favoris, cette information peut être associée à son compte afin
          de lui permettre de retrouver ses favoris lors de ses prochaines connexions. Les favoris sont conservés tant que le
          compte utilisateur existe ou jusqu’à leur suppression par l’utilisateur.
        </p>

        <h2 className="mt-4 font-semibold">5. Conservation des données</h2>
        <p>
          Les informations nécessaires au fonctionnement du compte sont conservées pendant la durée nécessaire à la fourniture du
          service. Lorsqu’un utilisateur demande la suppression de son compte, les données personnelles associées à ce compte sont
          supprimées ou anonymisées dans un délai raisonnable, sous réserve des obligations légales éventuelles.
        </p>

        <h2 className="mt-4 font-semibold">6. Partage des données</h2>
        <p>DataFlow ne vend ni ne loue les données personnelles des utilisateurs.</p>
        <p>
          Certaines données peuvent néanmoins être traitées par des prestataires techniques nécessaires au fonctionnement de Free
          Stream (fournisseur d’authentification, hébergement, base de données, services de sécurité). Ces prestataires n’utilisent
          les données que pour fournir leurs services à DataFlow.
        </p>

        <h2 className="mt-4 font-semibold">8. Cookies et technologies similaires</h2>
        <p>
          Free Stream peut utiliser des cookies ou technologies similaires pour maintenir une session utilisateur, sécuriser
          l’authentification, mémoriser certaines préférences et mesurer l’utilisation du service. Le mécanisme de gestion des
          cookies permet à l’utilisateur de gérer son consentement lorsque cela est requis.
        </p>

        <h2 className="mt-4 font-semibold">9. Sécurité</h2>
        <p>
          DataFlow met en œuvre des mesures techniques et organisationnelles raisonnables afin de protéger les informations des
          utilisateurs. Toutefois, aucun système ne garantit une sécurité absolue.
        </p>

        <h2 className="mt-4 font-semibold">10. Droits des utilisateurs</h2>
        <p>
          Selon la réglementation applicable, l’utilisateur peut exercer des droits : accès, rectification, suppression, limitation,
          opposition, retrait du consentement et portabilité. Pour exercer ces droits, contacter DataFlow à l’adresse indiquée
          ci-dessous (une vérification d’identité peut être demandée).
        </p>

        <h2 className="mt-4 font-semibold">11. Suppression du compte</h2>
        <p>
          L’utilisateur peut demander la suppression de son compte et des données associées en contactant DataFlow. La suppression
          entraîne la perte définitive des favoris et autres informations associées.
        </p>

        <h2 className="mt-4 font-semibold">12. Mineurs</h2>
        <p>
          Free Stream n’a pas vocation à collecter volontairement des données personnelles auprès de mineurs. Si un responsable
          légal demande la suppression de données fournies par un mineur, il peut contacter DataFlow.
        </p>

        <h2 className="mt-4 font-semibold">13. Modifications de la politique</h2>
        <p>
          DataFlow peut modifier la présente Politique de confidentialité. La version la plus récente sera publiée sur cette page
          avec sa date de mise à jour.
        </p>

        <h2 className="mt-4 font-semibold">14. Contact</h2>
        <p>
          Pour toute question concernant la protection des données personnelles ou l’exercice de vos droits :
        </p>
        <p>
          <strong>DataFlow</strong>
          <br /> E-mail : contactbeepai@gmail.com
        </p>

        <p className="mt-6 text-xs text-slate-500">© 2026 DataFlow — Free Stream. Tous droits réservés.</p>
      </section>
      </div>
    </main>
  )
}
