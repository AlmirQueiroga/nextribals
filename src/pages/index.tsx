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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [activeTab, setActiveTab] = useState<'hero' | 'gameMode' | 'mapa' | 'form' | 'count'>('hero');
  const { saveToJson, loadFromJson, loadFromWeb } = useContext(GameContext);
  const [heroiToEdit, setHeroiToEdit] = useState<Heroi | undefined>(undefined);

  const handleEdit = (heroi: Heroi) => {
    setHeroiToEdit(heroi); 
    setActiveTab('hero'); 
  };

  const handleLoadComps = (heroi: Heroi) => {
    setActiveTab('hero');
    loadFromWeb(WebGet.Comps, heroi.id);
  };

  return (
    <Container>
      <Header>
        <Title>Ribals Ribals</Title>
        <div>
          <Button onClick={saveToJson}>Salvar JSON</Button>
          <Button onClick={loadFromJson}>Carregar JSON</Button>
          <Button onClick={() => loadFromWeb(WebGet.Heroes)}>Carregar Herois da web</Button>
          <Button onClick={() => loadFromWeb(WebGet.Maps)}>Carregar Mapas da web</Button>
        </div>
      </Header>
      <Tabs>
        <TabButton
          active={activeTab === 'hero'}
          onClick={() => setActiveTab('hero')}
        >
          Add Heroi
        </TabButton>
        <TabButton
          active={activeTab === 'gameMode'}
          onClick={() => setActiveTab('gameMode')}
        >
          Add GameMode
        </TabButton>
        <TabButton
          active={activeTab === 'mapa'}
          onClick={() => setActiveTab('mapa')}
        >
          Add Mapa
        </TabButton>
        <TabButton
          active={activeTab === 'form'}
          onClick={() => setActiveTab('form')}
        >
          Add Formação
        </TabButton>
        <TabButton
          active={activeTab === 'count'}
          onClick={() => setActiveTab('count')}
        >
          Add Counter Groups
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
      </TabContent>
      <ContextDisplay />
    </Container>
  );
}
