import { createContext, useContext, useState } from "react";


interface User {

  email: string;
  role: string;
  full_name?: string;

}


interface AuthContextType {

  user: User | null;

  loading: boolean;

  login: (userData: User)=>void;

  logout: ()=>void;

}



const AuthContext = createContext<AuthContextType | null>(null);



export function AuthProvider({children}:{children:React.ReactNode}){


  const [loading,setLoading] = useState(false);


  const [user,setUser] = useState<User | null>(()=>{


    const savedUser = localStorage.getItem("user");


    if(savedUser){

      return JSON.parse(savedUser);

    }


    return null;


  });



  const login = (userData:User)=>{


    setUser(userData);


    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );


  };



  const logout = ()=>{


    setUser(null);


    localStorage.removeItem("user");


  };



  return (

    <AuthContext.Provider

      value={{

        user,

        loading,

        login,

        logout

      }}

    >

      {children}

    </AuthContext.Provider>


  );


}



export function useAuth(){


  const context = useContext(AuthContext);


  if(!context){

    throw new Error(
      "useAuth must be inside AuthProvider"
    );

  }


  return context;


}