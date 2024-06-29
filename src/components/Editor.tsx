"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { Button } from "./ui/button";
import Lottie from "react-lottie-player";
import { useAnimationStore } from "@/store/animation";
import { Label } from "@radix-ui/react-label";
import { Input } from "./ui/input";

const formSchema = z.object({
  animation: z.string(),
});

interface AnimationData {
  animation: string;
}

const docRef = doc(db, "userAnimation", "4wjyWL5Cj5hgAmRzVcvNiSol6uJ3");

export function Editor() {
  const { animation } = useAnimationStore();
  // const animationJson = animation ? JSON.parse(animation) : null;
  console.log(animation);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <InputFile />
      {animation && (
        <Lottie
          loop
          animationData={animation}
          play
          style={{ width: 500, height: 350 }}
        />
      )}
    </div>
  );
}

const InputFile: React.FC = () => {
  const { setAnimation } = useAnimationStore();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files ? event.target.files[0] : null;
    console.log(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result;
        if (fileContent) {
          try {
            const json = JSON.parse(fileContent as string);
            console.log(json);
            setAnimation(json); // Assuming setAnimation expects JSON content
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture">Lottie Files</Label>
      <Input id="jsonFile" type="file" onChange={handleChange} accept=".json" />
    </div>
  );
};
function TextareaForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      animation: "",
    },
  });
  const { setValue, getValues } = form;
  const { setAnimation } = useAnimationStore();

  useEffect(() => {
    // Listen to real-time updates
    const unsub = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as AnimationData;
        setValue("animation", data.animation);
        setAnimation(data.animation);
      } else {
        console.log("No such document!");
      }
    });

    return () => {
      unsub();
    };
  }, [setAnimation, setValue]);

  const saveJson = async (value: z.infer<typeof formSchema>) => {
    try {
      console.log(value);
      await setDoc(docRef, { animation: value.animation });
      setAnimation(value.animation);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const prettifyJson = () => {
    try {
      const currentValue = getValues("animation");
      const parsedJson = JSON.parse(currentValue);
      const prettyJson = JSON.stringify(parsedJson, null, 4);
      setValue("animation", prettyJson);
    } catch (error) {
      console.error("Invalid JSON format: ", error);
    }
  };

  return (
    <div className="flex flex-col">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(saveJson)}>
          <FormField
            control={form.control}
            name="animation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lottie JSON</FormLabel>
                <FormControl>
                  <Textarea placeholder="Lottie JSON Files" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="my-4 w-full">
            Save JSON
          </Button>
        </form>
      </Form>
      <Button className="my-4 w-full" onClick={prettifyJson}>
        Prettify
      </Button>
    </div>
  );
}
