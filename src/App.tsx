import "./App.css";
import { RegisterForm } from "./components/RegisterForm";
import { Editor } from "./components/Editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "./components/LoginForm";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useEffect } from "react";
import { useUserStore } from "./store/user";
import { Button } from "./components/ui/button";

function App() {
  const { currentUser, fetchUserInfo } = useUserStore();
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.uid) {
        fetchUserInfo(user.uid);
      } else {
        // Handle the case where there is no user or user.uid is undefined
        console.log("No user is signed in.");
      }
    });
    return () => {
      unsub();
    };
  }, [fetchUserInfo]);
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="w-full h-full theme-zinc">
        <div className="flex min-h-screen w-full flex-col">
          {currentUser ? (
            <>
              <Editor />
              <Button className="mt-10 max-w-32" onClick={() => auth.signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <Tabs defaultValue="account">
              <TabsList>
                <TabsTrigger value="account">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="account">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
