// pages/gerenciar-cardapio.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import 'bootstrap/dist/css/bootstrap.min.css';

function GerenciarCardapio() {
    const [itens, setItens] = useState([]);
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [preco, setPreco] = useState('');
    const [imagem, setImagem] = useState('');
    const [editando, setEditando] = useState(null); // ID do item que está sendo editado
    const router = useRouter();

    // Função para carregar os itens do cardápio
    useEffect(() => {
        async function carregarItens() {
            try {
                const response = await axios.get('https://backend-eg4g.onrender.com/api/cardapio');
                setItens(response.data);
            } catch (error) {
                console.error('Erro ao carregar os itens:', error);
            }
        }
        carregarItens();
    }, []);

    // Função para adicionar ou editar um item no cardápio
    const salvarItem = async (e) => {
        e.preventDefault();

        const novoItem = { nome, descricao, preco: parseFloat(preco), imagem };

        try {
            if (editando) {
                // Atualizar um item existente
                await axios.put(`https://backend-eg4g.onrender.com/api/cardapio/${editando}`, novoItem);
                setItens(itens.map(item => item._id === editando ? { ...item, ...novoItem } : item));
            } else {
                // Adicionar um novo item
                const response = await axios.post('https://backend-eg4g.onrender.com/api/cardapio', novoItem);
                setItens([...itens, response.data]);
            }

            // Limpa os campos do formulário e a edição
            setNome('');
            setDescricao('');
            setPreco('');
            setImagem('');
            setEditando(null);
        } catch (error) {
            console.error('Erro ao salvar o item:', error);
        }
    };

    // Função para remover um item do cardápio
    const removerItem = async (id) => {
        try {
            await axios.delete(`https://backend-eg4g.onrender.com/api/cardapio/${id}`);
            setItens(itens.filter(item => item._id !== id));
        } catch (error) {
            console.error('Erro ao remover o item:', error);
        }
    };

    // Função para iniciar a edição de um item
    const editarItem = (item) => {
        setNome(item.nome);
        setDescricao(item.descricao);
        setPreco(item.preco);
        setImagem(item.imagem);
        setEditando(item._id);
    };

    const goToMidias = () => {
        router.push('/ArmazenamentoMidias');
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center text-warning">Gerenciar Cardápio</h1>

            {/* Formulário para adicionar ou editar um item */}
            <form onSubmit={salvarItem} className="mt-4">
                <div className="form-group">
                    <label>Nome do Item</label>
                    <input
                        type="text"
                        className="form-control"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Descrição</label>
                    <textarea
                        className="form-control"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div className="form-group">
                    <label>Preço</label>
                    <input
                        type="number"
                        className="form-control"
                        value={preco}
                        onChange={(e) => setPreco(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>URL da Imagem</label>
                    <input
                        type="text"
                        className="form-control"
                        value={imagem}
                        onChange={(e) => setImagem(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-success mt-3">
                    {editando ? 'Salvar Alterações' : 'Adicionar Item'}
                </button>
            </form>

            {/* Listagem dos itens do cardápio */}
            <h2 className="mt-5">Itens do Cardápio</h2>
            <div className="row mt-3">
                {itens.map(item => (
                    <div key={item._id} className="col-md-4 mb-4">
                        <div className="card">
                            <img
                                src={item.imagem}
                                alt={item.nome}
                                className="card-img-top"
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <div className="card-body">
                                <h5 className="card-title">{item.nome}</h5>
                                <p className="card-text">{item.descricao}</p>
                                <p className="card-text">R$ {item.preco.toFixed(2)}</p>
                                <div className="d-flex justify-content-between">
                                    <button
                                        onClick={() => editarItem(item)}
                                        className="btn btn-warning"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => removerItem(item._id)}
                                        className="btn btn-danger"
                                    >
                                        Remover
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="d-flex justify-content-between">
                <button className="btn btn-info" onClick={goToMidias}>Gerenciar Mídias</button>
                <button
                    className="btn btn-secondary mt-4"
                    onClick={() => window.location.href = '/cardapio.html'}
                >
                    Ir para Cardápio
                </button>
            </div>
        </div>
    );
}

export default GerenciarCardapio;
