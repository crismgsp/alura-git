import { Box, Text, TextField, Image, Button, Icon } from '@skynexui/components';
import React from 'react';
import appConfig from '../config.json';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js'
import { ButtonSendSticker } from '../src/components/ButtonSendSticker';


//como fazer AJAX:https://medium.com/@omariosouto/entendendo-como-fazer-ajax-com-a-fetchapi-977ff20da3c6
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzMxMDg5MSwiZXhwIjoxOTU4ODg2ODkxfQ.GDuc0lFapkeF8kSHF9SdECP8-VB_QwJi2cK303-WS4o'
const SUPABASE_URL = 'https://vkrerrydbaustrhvtzjb.supabase.co';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escutaMensagemEmTempoReal(adicionaMensagem) {
    return supabaseClient
        .from('mensagens')
        .on('INSERT', (respostaLive) => {
            adicionaMensagem(respostaLive.new);

        })
        .subscribe();
}


export default function ChatPage() {
    const roteamento = useRouter();
    const usuarioLogado = roteamento.query.username;
    console.log('usuarioLogado', usuarioLogado);
    const [mensagem, setMensagem] = React.useState('');
    const [listaDeMensagens, setListaDeMensagens] = React.useState([]);


        React.useEffect(() => {
            supabaseClient
                .from('mensagens')
                .select("*")
                .order('id', { ascending: false })
                .then(({ data }) => {
                    setListaDeMensagens(data);
                });
            escutaMensagemEmTempoReal((novaMensagem) => {
                //handleNovaMensagem(novaMensagem)  isto aqui, neste lugar estava causando loop infinito....cadastrando a msg varias vezes
                //quando quer reusar um valor de referencia objeto/array passa uma funcao para setState
                setListaDeMensagens((valorAtualDaLista) => {
                    return [
                        novaMensagem,  // substitiu o termo mensagem por data é o dado na posicao 0 da lista, ele ta chamando de data no console so o que foi inserido..a ultima mensagem
                        ...valorAtualDaLista,
                    ]
                });
            });
         
            //return() => {
              //  PushSubscription.unsubscribe();
            //}    
        }, []);

        const mensagemID = (mensagem.id);

    function handleDelete(mensagemID){    
        const handleDelete = async(mensagemID) => {
        const { data, error } = await supabaseClient
        .from('mensagens')
        .delete()
        .match({ id: mensagemID });
        }
    };

    


        //.then(({ data}) => {
        //  const apagarelemento = listaDeMensagens.filter(
        //    (mensagem) => mensagem.id == mensagemID
        //)    
        //});
        //setListaDeMensagens(hande);

    



    function handleNovaMensagem(novaMensagem) {
        const mensagem = {
            //id: listaDeMensagens.length + 1,
            de: usuarioLogado,
            texto: novaMensagem,
        };

        supabaseClient
            .from('mensagens')
            .insert([
                //vai fazer um insert no banco de dados nome do objeto tem que ser igual nome do campo do banco de dados
                mensagem
            ])
            .then(({ data }) => {
                //     

            });


        setMensagem('');
    }

    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                //backgroundColor: appConfig.theme.colors.primary[500],
                backgroundColor: 'lightgreen',
                //backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    //backgroundColor: appConfig.theme.colors.neutrals[200],
                    backgroundColor: 'lightblue',
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        //backgroundColor: appConfig.theme.colors.neutrals[600],
                        backgroundColor: 'pink',
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',

                    }}

                >

                    <MessageList
                        mensagens={listaDeMensagens}
                        onDelete={handleDelete}

                    />

                        


                        <Box
                            as="form"
                            styleSheet={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <TextField
                                value={mensagem}
                                onChange={(event) => {
                                    const valor = event.target.value;
                                    setMensagem(valor);
                                }}
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        handleNovaMensagem(mensagem);

                                    }


                                }}


                                placeholder="Insira sua mensagem aqui..."
                                type="textarea"
                                styleSheet={{
                                    width: '100%',
                                    border: '0',
                                    resize: 'none',
                                    borderRadius: '5px',
                                    padding: '6px 8px',
                                    backgroundColor: appConfig.theme.colors.neutrals[200],
                                    marginRight: '12px',
                                    color: appConfig.theme.colors.neutrals[900],


                                }}

                            />
                            <ButtonSendSticker
                                onStickerClick={(sticker) => {
                                    handleNovaMensagem(':sticker: ' + sticker);
                                }}
                            />

                        </Box>
                </Box>
            </Box>
        </Box>
    )
}


function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'

                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    console.log('MessageList', props);
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'scroll',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                //cor da letra do texto
                color: appConfig.theme.colors.neutrals["500"],
                marginBottom: '16px',
            }}

            

        >
            {props.mensagens.map((mensagem) => {
                return (
                    <Text
                        key={mensagem.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',
                            hover: {
                                backgroundColor: appConfig.theme.colors.neutrals[100],
                            }
                        }}
                        

                    >

                        <Icon

                            name="FaTrash"
                            label="Apagar tudo"
                            styleSheet={{
                            display: "flex",
                            alignItems: "center",
                            margin: "10px",
                            width: "10px",
                            position: "absolute",
                            justifyContent: "space-between",
                            hover: {
                            color: "blue",
                            }

                            }}
                            onClick={(e) => {
                            e.preventDefault();
                            handleDelete(mensagem.id);
                            }}

                        />
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                            }}
                        >
                            <Image
                                styleSheet={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '8px',

                                }}
                                src={`https://github.com/${mensagem.de}.png`}
                            />
                            <Text tag="strong">
                                {mensagem.de}
                            </Text>
                            <Text
                                styleSheet={{
                                    fontSize: '10px',
                                    marginLeft: '8px',
                                    //color: appConfig.theme.colors.neutrals[300],
                                    color: 'red',
                                }}
                                tag="span"
                            >
                                {(new Date().toLocaleDateString())}
                            </Text>
                        </Box>
                        {/*Condicional: {mensagem.texto.startsWith(':sticker:').toString()*/}
                        {mensagem.texto.startsWith(':sticker:') //abaixo um jeito de fazer if else no react..modo declarativo...
                            ? (
                                <Image src={mensagem.texto.replace(':sticker:', '')} />
                            )
                            : (
                                mensagem.texto
                            )}

                    </Text>
                );
            })}



        </Box>
    )
}