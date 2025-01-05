import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import 'bootstrap/dist/css/bootstrap.min.css';

const MonitorPlaylistForm = () => {
    const [monitores, setMonitores] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [selectedMonitor, setSelectedMonitor] = useState('');
    const [selectedPlaylist, setSelectedPlaylist] = useState('');
    const [monitorName, setMonitorName] = useState('');
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [mediaCount, setMediaCount] = useState(0);
    const router = useRouter();

    const fetchMonitores = async () => {
        try {
            const response = await axios.get('https://backend-eg4g.onrender.com/monitores');
            setMonitores(response.data);
        } catch (error) {
            console.error('Erro ao buscar monitores:', error);
            alert('Erro ao buscar monitores: ' + error.message);
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

    useEffect(() => {
        fetchMonitores();
        fetchPlaylists();
    }, []);

    const handleCreateMonitor = async () => {
        if (!monitorName) {
            alert('Insira o nome do monitor');
            return;
        }

        try {
            const response = await axios.post('https://backend-eg4g.onrender.com/monitores', { name: monitorName });
            if (response.status === 201) {
                alert('Monitor criado com sucesso');
                setMonitorName('');
                fetchMonitores();
            } else {
                alert('Erro ao criar o monitor');
            }
        } catch (error) {
            console.error('Erro ao criar o monitor:', error);
            alert('Erro ao criar o monitor: ' + error.message);
        }
    };

    const handleDeleteMonitor = async (monitorId) => {
        try {
            const response = await axios.delete(`https://backend-eg4g.onrender.com/monitores/${monitorId}`);
            if (response.status === 200) {
                alert('Monitor excluído com sucesso');
                setMonitores(monitores.filter((monitor) => monitor._id !== monitorId));
            } else {
                alert('Erro ao excluir monitor');
            }
        } catch (error) {
            console.error('Erro ao excluir monitor:', error);
            alert('Erro ao excluir monitor: ' + error.response?.data?.message || 'Erro desconhecido');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMonitor || !selectedPlaylist) {
            alert('Selecione um monitor e uma playlist!');
            return;
        }

        try {
            const response = await axios.put(`https://backend-eg4g.onrender.com/monitores/${selectedMonitor}`, {
                playlistId: selectedPlaylist,
            });
            if (response.status === 200) {
                alert('Monitor atualizado com sucesso!');
                fetchMonitores();
            } else {
                alert('Erro ao atualizar o monitor');
            }
        } catch (error) {
            console.error('Erro ao atualizar o monitor:', error);
            alert('Erro ao atualizar o monitor: ' + error.message);
        }
    };

    const goToIndex = () => {
        router.push('/');
    };

    return (
        <div className="container">
            <h1>Gerenciar Monitores</h1>

            <input
                type="text"
                className="form-control mb-3"
                value={monitorName}
                onChange={(e) => setMonitorName(e.target.value)}
                placeholder="Nome do Monitor"
            />
            <button className="btn btn-primary mb-4" onClick={handleCreateMonitor}>Criar Monitor</button>

            <h2>Monitores Criados</h2>
            {monitores.length > 0 ? (
                <ul className="list-group mb-4">
                    {monitores.map((monitor) => (
                        <li key={monitor._id} className="list-group-item">
                            <h3>{monitor.name}</h3>
                            {monitor.playlist ? (
                                <div>
                                    <h4>Playlist: {monitor.playlist.name}</h4>
                                    <div className="media-preview">
                                        {monitor.playlist.midias && monitor.playlist.midias.length > 0 && (
                                            <img
                                                src={`https://backend-eg4g.onrender.com${monitor.playlist.midias[currentMediaIndex]?.url}`}
                                                alt="Mídia atual"
                                                className="img-fluid"
                                                style={{ width: '150px', height: '100px' }}
                                            />
                                        )}
                                        <span>Mídia atual</span>
                                    </div>
                                </div>
                            ) : (
                                <p>Nenhuma playlist associada</p>
                            )}
                            <button className="btn btn-danger" onClick={() => handleDeleteMonitor(monitor._id)}>
                                Excluir Monitor
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Nenhum monitor criado ainda.</p>
            )}

            <h2>Associar Monitor a Playlist</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Selecione o Monitor:</label>
                    <select
                        value={selectedMonitor}
                        className="form-select"
                        onChange={(e) => setSelectedMonitor(e.target.value)}
                    >
                        <option value="">Selecione um monitor</option>
                        {monitores.map((monitor) => (
                            <option key={monitor._id} value={monitor._id}>
                                {monitor.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label>Selecione a Playlist:</label>
                    <select
                        value={selectedPlaylist}
                        className="form-select"
                        onChange={(e) => setSelectedPlaylist(e.target.value)}
                    >
                        <option value="">Selecione uma playlist</option>
                        {playlists.map((playlist) => (
                            <option key={playlist._id} value={playlist._id}>
                                {playlist.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="btn btn-success">Atualizar Monitor</button>
            </form>

            <button className="btn btn-info mt-4" onClick={goToIndex}>
                Ir para a Página Inicial
            </button>
        </div>
    );
}



export default MonitorPlaylistForm;
