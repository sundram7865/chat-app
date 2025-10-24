"use client"
import ChatSidebar from '@/components/ChatSidebar'
import Loading from '@/components/Loading'
import { useAppData, User } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'
import axios from 'axios'
import { chat_service } from '@/context/AppContext'
import ChatHeader from '@/components/ChatHeader'
import ChatMessages from '@/components/ChatMessages'
export interface Message{
  _id:string;
  chatId:string;
  sender:string;
  text?:string;
  image?:{
    url:string;
    publicId:string; 
  }
  messageType:"text"|"image";
  seen:boolean;
  seenAt?:Date;
  createdAt:string;
}

const ChatApp = () => {
    const {isAuth,
           loading,
           logoutUser,
           chats,
           user:loggedInUser,
          users,
          fetchChats,
          setChats
    }=useAppData()
      
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [message,setMessage]= useState("")
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [messages, setMessages] = useState<Message[] | null>(null);
    const [user,setuser]=useState<User | null>(null)
    const [showAllUsers, setShowAllUsers] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeOut, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

    const router=useRouter();

    useEffect(()=>{
        if(!isAuth && !loading) router.push('/login')
    },[isAuth,loading,router])

    const handleLogout=()=> logoutUser();

    async function fetchChat(){
      try{
        const token = Cookies.get("token");
        const {data}= await axios.get(`${chat_service}/api/v1/message/${selectedUser}`,{
          headers:{
            Authorization:`Bearer ${token}`
          }
        })
        setMessages(data.messages);
        setuser(data.user);
        await fetchChats();
        }
      catch(error)
      {   
          console.log(error);
          toast.error("Failed to load messagaes")
      }
    }

    async function createChat(u:User){
      try{
        const token = Cookies.get("token");
        const {data}= await axios.post(`${chat_service}/api/v1/chat/new`,{userId:
          loggedInUser?._id,otherUserId:u._id
        },{
          headers:{
            Authorization:`Bearer ${token}`
          }
        })
        setSelectedUser(data.chatId);
        setShowAllUsers(false)
        await fetchChats()
      }catch(error)
      {
          toast.error("Failed to start chat")
      }
    }
    useEffect(()=>{
      if(selectedUser){
        fetchChat();
      } 
    },[selectedUser])
    if(loading) return <Loading/>
  return (
    <div className='min-h-screen flex bg-gray-900 text-white 
    relative overflow-hidden'>
     <ChatSidebar sidebarOpen={true} setSidebarOpen={setSidebarOpen} showAllUsers={showAllUsers}
     setShowAllUsers={setShowAllUsers} users={users} loggedInUser={loggedInUser}
     chats={chats} selectedUser={selectedUser} setSelectedUser={setSelectedUser}
     handleLogout={handleLogout} createChat={createChat}
     />
     <div className="flex-1 flex flex-col justify-between p-4 backdrop-blur-xl
     bg-white/5 border-1 border-white/10">
      <ChatHeader user={user} setSidebarOpen={setSidebarOpen} isTyping={isTyping}/>
      <ChatMessages selectedUser={selectedUser} messages={messages} loggedInUser={loggedInUser}/>
     </div>
    </div>
  )
}

export default ChatApp
