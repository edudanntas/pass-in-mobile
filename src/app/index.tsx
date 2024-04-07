import { Image, View, Alert } from 'react-native'
import { useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Link, Redirect, router } from 'expo-router'
import { api } from '@/server/api'

import { colors } from '@/styles/colors'

import { useBadgeStore } from '@/store/badge-store'

import { Input } from '@/components/input'
import Button from '@/components/button'
import { useCheckinStore } from '@/store/checkin-store'

const Home = () => {
    const [value, setValue] = useState("");
    const [isLoading, setIsLoading] = useState(false)

    const badgeStore = useBadgeStore()
    const checkinStore = useCheckinStore()


    async function handleAccessEvent() {
        try {
            if (!value.trim()) {
                return Alert.alert("Ingresso", "Informe o código do ingresso")
            }
            setIsLoading(true)

            const badgeResponseData = await api.get(`/attendees/${value}/badge`)
            const checkinResponseData = await api.get(`/attendees/${value}/check-in`)

            if (checkinResponseData.status == 200) {
                checkinStore.save(checkinResponseData.data)
            }
            badgeStore.save(badgeResponseData.data.attendeeBadgeDTO);

            setIsLoading(false)

            router.push("/ticket")

        } catch (error) {

            console.log(error);
            setIsLoading(false)

            Alert.alert("Ingresso", "Ingresso não encontrado")
        }
    }

    if (badgeStore.data?.checkinURL) {
        return <Redirect href="/ticket" />
    }

    return (
        <View className='flex-1 items-center justify-center bg-green-500 p-8'>
            <Image source={require('@/assets/logo.png')} className='h-16' resizeMode='contain' />

            <View className='w-full mt-12 gap-3'>
                <Input>
                    <MaterialCommunityIcons name='ticket-confirmation-outline'
                        size={20}
                        color={colors.green[200]}
                    />
                    <Input.Fields
                        placeholder='Código do ingresso'
                        onChangeText={setValue}
                        autoCapitalize='none'
                    />
                </Input>

                <Button title='Acessar credencial' onPress={handleAccessEvent} isLoading={isLoading} />

                <Link href="/register" className='text-gray-100 text-base font-bold mt-8 text-center'>
                    Ainda não possuí ingresso?
                </Link>
            </View>
        </View >
    )
}

export default Home