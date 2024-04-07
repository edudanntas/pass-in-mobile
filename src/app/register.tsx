import { Alert, Image, View } from 'react-native'
import { FontAwesome6, MaterialIcons } from '@expo/vector-icons'
import { Link, router } from 'expo-router'
import axios from 'axios'

import { colors } from '@/styles/colors'

import { api } from '@/server/api';

import { useBadgeStore } from '@/store/badge-store'
import { useCheckinStore } from '@/store/checkin-store'

const EVENT_ID = "de870903-d942-4240-b778-ac74ed556b8c"

import { Input } from '@/components/input'
import Button from '@/components/button'
import { useState } from 'react'

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false)

    const badgeStore = useBadgeStore()
    const checkinStore = useCheckinStore()

    async function handleRegister() {
        try {
            if (!name.trim() || !email.trim()) {
                return Alert.alert("Dados pessoais", "Preencha todos os dados pessoais")
            }

            setIsLoading(true)

            const registeredResponse = await api.post(`/events/${EVENT_ID}/attendees`, {
                name: name.trim(),
                email: email.trim()
            })

            if (registeredResponse.data.id) {

                const badgeResponse = await api.get(`/attendees/${registeredResponse.data.id}/badge`)
                const checkinResponse = await api.get(`/attendees/${registeredResponse.data.id}/check-in`)

                if (checkinResponse.status == 200) {
                    checkinStore.save(checkinResponse.data)
                }

                console.log(checkinStore.data);

                badgeStore.save(badgeResponse.data.attendeeBadgeDTO)

                Alert.alert("Inscrição", "Inscrição realizada com sucesso.", [
                    { text: "Ok", onPress: () => router.push("/ticket") }
                ])
            }
        } catch (error) {
            console.log(error);
            setIsLoading(false)

            if (axios.isAxiosError(error)) {
                if (error.response?.status == 409) {
                    return Alert.alert("Inscrição", "Este e-mail já está cadastrado.")
                }
            }

            Alert.alert("Inscrição", "Não foi possivel realizar a inscrição!")
        }
    }

    return (
        <View className='flex-1 items-center justify-center bg-green-500 p-8'>
            <Image source={require('@/assets/logo.png')} className='h-16' resizeMode='contain' />

            <View className='w-full mt-12 gap-3'>
                <Input>
                    <FontAwesome6 name='user-circle'
                        size={20}
                        color={colors.green[200]}
                    />
                    <Input.Fields
                        placeholder='Nome completo'
                        onChangeText={setName}
                        autoCapitalize='none'
                    />
                </Input>

                <Input>
                    <MaterialIcons name='alternate-email'
                        size={20}
                        color={colors.green[200]}
                    />
                    <Input.Fields
                        placeholder='E-mail'
                        keyboardType='email-address'
                        onChangeText={setEmail}
                        autoCapitalize='none'
                    />
                </Input>

                <Button title='REalizar inscrição' onPress={handleRegister} isLoading={isLoading} />

                <Link href="/" className='text-gray-100 text-base font-bold mt-8 text-center'>
                    Já possuí ingresso?
                </Link>
            </View>
        </View >
    )
}

export default Register