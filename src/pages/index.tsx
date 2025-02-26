import { Geist, Geist_Mono } from "next/font/google";
import { ContextDisplay } from "@/components/contextDisplay";
import { HeroiList } from "@/components/heroList";
import { GameContext } from "@/context/context";
import { Container, Header, Title, Button, Tabs, TabButton, TabContent } from "@/styles";
import { Heroi, WebGet } from "@/types/types";
import { useState, useContext } from "react";
import { AddFormacaoForm } from "@/components/formacaoForm";
import { AddGameModeForm } from "@/components/gameModeForm";
import { AddHeroiForm } from "@/components/heroPage";
import { AddMapaForm } from "@/components/mapaForm";
import { CountersGroupForm } from "@/components/countersGroupForm";
import { TeamUpForm } from "@/components/teamUpForm";
import { useRouter } from "next/router";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [activeTab, setActiveTab] = useState<'hero' | 'gameMode' | 'mapa' | 'form' | 'count' | 'teams'>('hero');
  const { saveToJson, loadFromJson, loadFromWeb, loadAllPercentages } = useContext(GameContext);
  const [heroiToEdit, setHeroiToEdit] = useState<Heroi | undefined>(undefined);
  const router = useRouter();

  const handleEdit = (heroi: Heroi) => {
    setHeroiToEdit(heroi); 
    setActiveTab('hero'); 
  };

  const handleLoadComps = (heroi: Heroi) => {
    setActiveTab('hero');
    loadFromWeb(WebGet.Comps, heroi.id);
  };

  const handleSeeComps = (e : React.MouseEvent) => {
    e.preventDefault()
    router.push('/compsPage');
  }

  return (
    <Container>
      <Header>
        <Title>Ribals Ribals</Title>
        <div>
          <Button onClick={saveToJson}>Salvar JSON</Button>
          <Button onClick={loadFromJson}>Carregar JSON</Button>
          <Button onClick={() => loadFromWeb(WebGet.Heroes)}>Carregar Herois da web</Button>
          <Button onClick={() => loadFromWeb(WebGet.Maps)}>Carregar Mapas da web</Button>
          <Button onClick={() => loadAllPercentages()}>Carregar todas as comps</Button>

          <Button onClick={handleSeeComps}>É agora</Button>
        </div>
      </Header>
      <Tabs>
        <TabButton
          active={activeTab === 'hero'}
          onClick={() => setActiveTab('hero')}
        >
          Herois
        </TabButton>
        <TabButton
          active={activeTab === 'gameMode'}
          onClick={() => setActiveTab('gameMode')}
        >
          GameMode
        </TabButton>
        <TabButton
          active={activeTab === 'mapa'}
          onClick={() => setActiveTab('mapa')}
        >
          Mapas
        </TabButton>
        <TabButton
          active={activeTab === 'form'}
          onClick={() => setActiveTab('form')}
        >
          Formações
        </TabButton>
        <TabButton
          active={activeTab === 'count'}
          onClick={() => setActiveTab('count')}
        >
          Counter Groups
        </TabButton>
        <TabButton
          active={activeTab === 'teams'}
          onClick={() => setActiveTab('teams')}
        >
          Teamups
        </TabButton>
      </Tabs>
      <TabContent>
        {activeTab === 'hero' && (
          <>
            <AddHeroiForm heroiToEdit={heroiToEdit} setHeroEdit={setHeroiToEdit}/>
            <HeroiList onEdit={handleEdit} loadComps={handleLoadComps} />
          </>
        )}
        {activeTab === 'gameMode' && (
          <>
            <AddGameModeForm />
          </>
        )}
        {activeTab === 'mapa' && (
          <>
            <AddMapaForm />
          </>
        )}
        {activeTab === 'form' && (
          <>
            <AddFormacaoForm />
          </>
        )}
        {activeTab === 'count' && (
          <>
            <CountersGroupForm/>
          </>
        )}
        {activeTab === 'teams' && (
          <>
            <TeamUpForm/>
          </>
        )}
      </TabContent>
      <ContextDisplay />
    </Container>
  );
}
