import "./App.css";
import { RegisterForm } from "./components/RegisterForm";
import { Editor } from "./components/Editor";

function App() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="w-full h-full theme-zinc">
        <div className="flex min-h-screen w-full flex-col">
          {/* <LoginForm /> */}
          <RegisterForm />
          <Editor />
        </div>
      </div>
    </div>
  );
}

export default App;
