function App() {
  const currentHostname = window.location.hostname;
  const isUrlChefDeCentre = 
    currentHostname.includes('chef-de-centre') || 
    import.meta.env.VITE_APP_MODE === 'CHEF_TERRAIN';

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isUrlChefDeCentre ? (
              <Navigate to="/register-chef" replace />
            ) : (
              <PortailPublic />
            )
          } 
        />
        
        <Route path="/login" element={<Login />} />  
        <Route path="/register-chef" element={<AuthChefCentre />} /> 
        <Route path="/dashboard" element={<DashboardAdmin />} />
        <Route path="/chef-de-centre" element={<EspaceChefCentre />} />
        <Route path="/demande-diplome" element={<DemandeClient />} />
        <Route path="/fiche-pv-examen" element={<SaisieCentreTerrain />} />
        <Route path="/saisie-notes" element={<SaisieNotes />} />

        <Route path="*" element={<Navigate to={isUrlChefDeCentre ? "/register-chef" : "/"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
