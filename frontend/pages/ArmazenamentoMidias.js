import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    const [file, setFile] = useState(null);
    const [midias, setMidias] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylists, setSelectedPlaylists] = useState({});
    const [textContent, setTextContent] = useState(''); // Estado para armazenar o conteúdo do arquivo txt
    const router = useRouter(); // Instância do useRouter

    const handleUpload = async () => {
        if (!file) {
            alert('Selecione uma mídia para fazer o upload');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post('https://backend-eg4g.onrender.com/midias', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Mídia enviada com sucesso!');
            setFile(null);
            fetchMidias(); // Atualiza a lista de mídias após o upload
        } catch (error) {
            console.error('Erro ao fazer upload da mídia:', error);
            alert('Erro ao fazer upload da mídia.');
        }
    };

    const fetchMidias = async () => {
        try {
            const response = await axios.get('https://backend-eg4g.onrender.com/midias');
            setMidias(response.data);
        } catch (error) {
            console.error('Erro ao buscar mídias:', error);
        }
    };

    const fetchPlaylists = async () => {
        try {
            const response = await axios.get('https://backend-eg4g.onrender.com/playlists');
            setPlaylists(response.data);
        } catch (error) {
            console.error('Erro ao buscar playlists:', error);
        }
    };

    const handleRemove = async (id) => {
        try {
            const response = await axios.delete(`https://backend-eg4g.onrender.com/midias/${id}`);
            alert('Mídia removida com sucesso!');
            fetchMidias(); // Atualiza a lista de mídias após a remoção
        } catch (error) {
            console.error('Erro ao remover a mídia:', error.response?.data || error.message);
            alert('Erro ao remover a mídia. Detalhes: ' + (error.response?.data.message || error.message));
        }
    };

    const handleAssociate = async (midiaId) => {
        const selectedPlaylist = selectedPlaylists[midiaId];

        if (!midiaId || !selectedPlaylist) {
            alert('Selecione uma mídia e uma playlist para associar.');
            return;
        }

        try {
            await axios.post(`https://backend-eg4g.onrender.com/playlists/${selectedPlaylist}/midias/${midiaId}`);
            alert('Mídia associada à playlist com sucesso!');
            fetchMidias(); // Atualiza a lista de mídias após associar
        } catch (error) {
            console.error('Erro ao associar mídia à playlist:', error);
            alert('Erro ao associar mídia à playlist.');
        }
    };

    const fetchTextContent = async (url) => {
        try {
            const response = await axios.get(url);
            setTextContent(response.data);
        } catch (error) {
            console.error('Erro ao buscar conteúdo do arquivo:', error);
        }
    };

    const goTogerenciar = () => {
        router.push('/gerenciar-cardapio'); // Redireciona para monitores.js
    };

    useEffect(() => {
        fetchMidias();
        fetchPlaylists();
    }, []);

    return (
        <div className="container mt-4">
            <h2>Enviar Mídia</h2>
            <input type="file" className="form-control mb-2" onChange={(e) => setFile(e.target.files[0])} />
            <button className="btn btn-primary" onClick={handleUpload}>Enviar Mídia</button>

            <h2 className="mt-4">Mídias</h2>
            <ul className="list-group">
                {midias.map((midia) => (
                    <li key={midia._id} className="list-group-item d-flex align-items-center">
                        <p className="mb-0">{midia.name}</p>
                        {/* Renderiza o preview dependendo do tipo de mídia */}
                        {midia.type === 'image' && (
                            <img src={midia.url} alt={midia.name} style={{ width: '50px', height: 'auto', marginLeft: '10px' }} />
                        )}
                        {midia.type === 'video' && (
                            <video controls style={{ width: '150px', height: 'auto', marginLeft: '10px' }}>
                                <source src={midia.url} type="video/mp4" />
                                Seu navegador não suporta a tag de vídeo.
                            </video>
                        )}
                        {midia.type === 'text' && (
                            <div style={{ marginLeft: '10px' }}>
                                <button
                                    className="btn btn-info"
                                    onClick={() => fetchTextContent(midia.url)}>
                                    Mostrar Conteúdo
                                </button>
                            </div>
                        )}
                        <button className="btn btn-danger ms-auto" onClick={() => handleRemove(midia._id)}>Remover</button>
                        <select
                            className="form-select ms-2"
                            onChange={(e) => {
                                setSelectedPlaylists((prev) => ({
                                    ...prev,
                                    [midia._id]: e.target.value,
                                }));
                            }}
                            value={selectedPlaylists[midia._id] || ''}
                        >
                            <option value="">Selecionar Playlist</option>
                            {playlists.map((playlist) => (
                                <option key={playlist._id} value={playlist._id}>
                                    {playlist.name}
                                </option>
                            ))}
                        </select>
                        <button className="btn btn-success" onClick={() => handleAssociate(midia._id)}>Associar</button>
                    </li>
                ))}
            </ul>

            {/* Mostra o conteúdo do arquivo de texto, se houver */}
            {textContent && (
                <div className="mt-4" style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                    <h3>Conteúdo do Arquivo de Texto:</h3>
                    <pre>{textContent}</pre>
                </div>
            )}
            <div className="d-flex justify-content-between">
                <button className="btn btn-secondary mt-4" onClick={() => router.push('/')}>Retornar ao Início</button>
                <button className="btn btn-secondary mt-4" onClick={goTogerenciar}>Gerenciar cardapio</button>
            </div>
        </div>
    );
}

export default App;