import Credential from '@/components/credential'
import Header from '@/components/header'
import { ScrollView, Text, TouchableOpacity, View, Alert, Modal, Share } from 'react-native'
import { MotiView } from 'moti'
import * as Brightness from 'expo-brightness';
import { FontAwesome } from '@expo/vector-icons'
import { colors } from '@/styles/colors'
import Button from '@/components/button'
import * as ImagePicker from 'expo-image-picker'
import { useEffect, useState } from "react"
import QRcode from '@/components/QRcode'
import { useBadgeStore } from '@/store/badge-store';
import { useCheckinStore } from '@/store/checkin-store';
import { router } from 'expo-router';
import { checkCheckinStatus } from '@/services/checkinStatus'


const Ticket = () => {
    const [showQrcode, setShowQRcode] = useState(false)
    const [originalBrightness, setOriginalBrightness] = useState(0);

    const badgeStore = useBadgeStore()
    const checkinStore = useCheckinStore()

    useEffect(() => {
        const checkChekinPeriodacally = async () => {
            try {
                const checkinStatus = await checkCheckinStatus(badgeStore.data?.id)

                if (checkinStatus) {
                    checkinStore.save(checkinStatus)
                }
            } catch (error) {
                console.error("Error checking check-in status:", error)
            }
        }

        checkChekinPeriodacally()

        const intervalId = setInterval(checkChekinPeriodacally, 5000)

        return () => clearInterval(intervalId);
    }, [badgeStore.data?.id])

    async function handleShare() {
        try {
            if (badgeStore.data?.checkinURL) {
                await Share.share({
                    message: badgeStore.data.checkinURL
                })
            }

        } catch (error) {
            console.log(error);
            Alert.alert("Compartilhar", "Não foi possível compartilhar esse evento.")
        }

    }

    async function getCredentialImage() {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 4]
            })

            if (result.assets) {
                badgeStore.changeAvatar(result.assets[0].uri)
            }

        } catch (error) {
            console.log(error)
            return Alert.alert("Imagem", "Não foi possivel selecionar a imagem")
        }
    }

    function toggleModal() {
        setShowQRcode(!showQrcode)
        if (!showQrcode) {
            Brightness.getBrightnessAsync().then(brightness => {
                setOriginalBrightness(brightness);
                Brightness.setBrightnessAsync(1);
            })
        } else {
            Brightness.setBrightnessAsync(originalBrightness);
        }

    }

    function removeTicket() {
        badgeStore.remove()
        checkinStore.remove()
        router.push("/")
    }

    function alertRemoveTicket() {
        Alert.alert("Ingresso", "Deseja remover o seu ingresso?", [
            { text: "Sim", onPress: () => removeTicket() },
            { text: "Não" }
        ])
    }

    return (
        <View className='flex-1 bg-green-500'>
            <Header title="Minhas Credenciais" />

            <ScrollView
                className='-mt-28 -z-10'
                contentContainerClassName='px-8 mb-6'
                showsVerticalScrollIndicator={false}
            >
                <Credential
                    handleChangeAvatar={getCredentialImage}
                    handleShowQRcode={toggleModal}
                    data={badgeStore.data!}
                    checkin={checkinStore.data!}
                />

                <MotiView
                    from={{
                        translateY: 0
                    }}
                    animate={{
                        translateY: 10
                    }}
                    transition={{
                        loop: true,
                        type: 'timing',
                        duration: 700
                    }}
                >
                    <FontAwesome name='angle-double-down' size={24} color={colors.gray[300]}
                        className='self-center my-6'
                    />
                </MotiView>

                <Text className='text-white font-bold text-2xl mt-4'>Compartilhar credencial</Text>


                <Text className='text-white font-regular text-base mt-1 mb-6'>Mostre ao mundo que você vai participar do evento {badgeStore.data?.eventTitle}</Text>

                <Button title='Compartilhar' onPress={handleShare} />

                <TouchableOpacity activeOpacity={0.7} className='mt-10' onPress={alertRemoveTicket}>
                    <Text className='text-base text-white font-bold text-center mb-10'>Remover Ingresso</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={showQrcode} statusBarTranslucent animationType='slide'>
                <View className='flex-1 bg-green-500 items-center justify-center'>
                    <QRcode value={badgeStore.data?.checkinURL!} size={300} />
                    <TouchableOpacity onPress={toggleModal}>
                        <Text className='font-bold text-orange-500 text-2xl mt-10 text-center'>Fechar</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    )
}

export default Ticket