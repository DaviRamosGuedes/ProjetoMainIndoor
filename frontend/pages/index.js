import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router'; // Importa useRouter para navegação
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
  const [playlistName, setPlaylistName] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [files, setFiles] = useState([]);
  const router = useRouter(); // Inicializa o hook useRouter

  // Função para criar uma nova playlist
  const handleCreatePlaylist = async () => {
    if (!playlistName) {
      alert('Insira o nome da playlist');
      return;
    }

    try {
      const response = await axios.post(`https://backend-eg4g.onrender.com/playlists`, { name: playlistName });

      if (response.status === 201) {
        alert('Playlist criada com sucesso');
        setPlaylistName('');
        fetchPlaylists(); // Atualiza a lista de playlists
      } else {
        alert('Erro ao criar a playlist');
      }
    } catch (error) {
      console.error('Erro ao criar a playlist:', error);
      alert('Erro ao criar a playlist');
    }
  };

  // Função para buscar todas as playlists e suas mídias
  const fetchPlaylists = async () => {
    try {
      const response = await axios.get(`https://backend-eg4g.onrender.com/playlists`);
      setPlaylists(response.data);
    } catch (error) {
      console.error('Erro ao buscar playlists:', error);
    }
  };

  // Função para excluir uma playlist
  const handleDeletePlaylist = async (playlistId) => {
    try {
      await axios.delete(`https://backend-eg4g.onrender.com/playlists/${playlistId}`);
      setPlaylists(playlists.filter((playlist) => playlist._id !== playlistId));
      if (selectedPlaylist && selectedPlaylist._id === playlistId) {
        setSelectedPlaylist(null);
      }
    } catch (error) {
      console.error('Erro ao excluir playlist:', error);
    }
  };

  // Função para fazer upload de mídias dentro da playlist selecionada
  const handleUploadMidias = async () => {
    if (!selectedPlaylist) {
      alert('Nenhuma playlist selecionada');
      return;
    }

    // Verifica se há arquivos para enviar
    if (files.length === 0) {
      alert('Nenhum arquivo selecionado para enviar.');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('midias', files[i]);
    }

    try {
      const response = await axios.post(`https://backend-eg4g.onrender.com/playlists/${selectedPlaylist._id}/midias`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200) {
        alert('Mídias enviadas com sucesso');
        // Atualiza a playlist para incluir as novas mídias
        const updatedPlaylist = { ...selectedPlaylist, midias: response.data.midias };
        setPlaylists(playlists.map((playlist) =>
          playlist._id === selectedPlaylist._id ? updatedPlaylist : playlist
        ));
        setSelectedPlaylist(updatedPlaylist);
      } else {
        alert('Erro ao enviar as mídias.');
      }
    } catch (error) {
      console.error('Erro ao fazer upload de mídia:', error);
      alert('Erro ao fazer upload de mídia.');
    }
  };

  // Função para selecionar uma playlist e exibir suas mídias
  const handleSelectPlaylist = (playlist) => {
    setSelectedPlaylist(playlist);
  };

  // Atualiza as playlists na primeira renderização
  useEffect(() => {
    fetchPlaylists();
  }, []);

  // Função para renderizar a visualização da mídia (imagem, vídeo ou texto)
  const renderMidiasPreview = (midiasItem) => {
    if (!midiasItem || !midiasItem.url) {
      return <p>Mídia não disponível</p>; // Mensagem de erro ou alternativa
    }

    const fileType = midiasItem.url.split('.').pop().toLowerCase();

    // Exibe imagem se o tipo for compatível
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
      return (
        <img
          src={`https://backend-eg4g.onrender.com${midiasItem.url}`} // Certifique-se de que o prefixo está correto
          alt={midiasItem.name}
          style={{ maxWidth: '200px', maxHeight: '200px' }}
        />
      );
    }

    // Exibe vídeo se o tipo for compatível
    if (['mp4', 'webm', 'ogg'].includes(fileType)) {
      return (
        <video controls style={{ maxWidth: '400px', maxHeight: '300px' }}>
          <source src={`https://backend-eg4g.onrender.com${midiasItem.url}`} type={`video/${fileType}`} />
          Seu navegador não suporta a tag de vídeo.
        </video>
      );
    }

    // Exibe o conteúdo de texto se for um arquivo .txt
    if (fileType === 'txt') {
      return (
        <iframe
          src={`https://backend-eg4g.onrender.com${midiasItem.url}`}
          title={midiasItem.name}
          style={{ width: '400px', height: '300px', border: '1px solid #ccc' }}
        ></iframe>
      );
    }

    // Retorna apenas o nome se o tipo não for reconhecido
    return <p>{midiasItem.name}</p>;
  };

  // Função para lidar com o arrastar e soltar de arquivos
  const handleDrop = (e) => {
    e.preventDefault();
    setFiles(e.dataTransfer.files);
  };

  // Função para excluir uma mídia da playlist selecionada
  const handleDeleteMidia = async (playlistId, midiaId) => {
    try {
      // Chama a rota de exclusão
      const response = await axios.delete(`https://backend-eg4g.onrender.com/playlists/${playlistId}/midias/${midiaId}`);

      // Atualiza a playlist localmente
      const updatedMidias = selectedPlaylist.midias.filter((midia) => midia._id !== midiaId);
      const updatedPlaylist = { ...selectedPlaylist, midias: updatedMidias };

      setPlaylists(playlists.map((playlist) =>
        playlist._id === playlistId ? updatedPlaylist : playlist
      ));
      setSelectedPlaylist(updatedPlaylist);
      alert('Mídia excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir mídia:', error);
      alert('Erro ao excluir mídia');
    }
  };

  // Função para redirecionar para a página monitores.js
  const goToMonitores = () => {
    router.push('/monitores'); // Redireciona para monitores.js
  };

  const goToMidias = () => {
    router.push('/ArmazenamentoMidias'); // Redireciona para monitores.js
  };

  return (
    <div className="container">
      <h1>Criar Playlist</h1>
      <input
        type="text"
        className="form-control mb-3"
        value={playlistName}
        onChange={(e) => setPlaylistName(e.target.value)}
        placeholder="Nome da Playlist"
      />
      <button className="btn btn-primary mb-4" onClick={handleCreatePlaylist}>Criar Playlist</button>

      <h2>Playlists Criadas</h2>
      <ul className="list-group mb-4">
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <li key={playlist._id} className="list-group-item">
              <h3>{playlist.name}</h3>
              <button className="btn btn-danger" onClick={() => handleDeletePlaylist(playlist._id)}>Excluir Playlist</button>
              <button className="btn btn-secondary" onClick={() => handleSelectPlaylist(playlist)}>Selecionar Playlist</button>
            </li>
          ))
        ) : (
          <p>Nenhuma playlist criada ainda.</p>
        )}
      </ul>

      {selectedPlaylist && (
        <div className="playlist mb-4">
          <h2>Mídias da Playlist: {selectedPlaylist.name}</h2>
          <div
            className="drop-area border border-dashed p-4 mb-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <p>Arraste e solte as mídias aqui ou clique para selecionar arquivos</p>
          </div>
          <button className="btn btn-success mb-3" onClick={handleUploadMidias}>Enviar Mídias</button>
          <ul className="list-group">
            {selectedPlaylist.midias.map((midia) => (
              <li key={midia._id} className="list-group-item">
                {renderMidiasPreview(midia)}
                <button className="btn btn-danger" onClick={() => handleDeleteMidia(selectedPlaylist._id, midia._id)}>Excluir Mídia</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="d-flex justify-content-between">
        <button className="btn btn-info" onClick={goToMonitores}>Gerenciar Monitores</button>
        <button className="btn btn-info" onClick={goToMidias}>Gerenciar Mídias</button>
      </div>
    </div>
  );
}
