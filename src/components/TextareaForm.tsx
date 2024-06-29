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

const formSchema = z.object({
  animation: z.string(),
});

interface AnimationData {
  animation: string;
}

const docRef = doc(db, "userAnimation", "4wjyWL5Cj5hgAmRzVcvNiSol6uJ3");

export function TextareaForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      animation: "",
    },
  });
  const { setValue } = form;

  useEffect(() => {
    // Listen to real-time updates
    const unsub = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as AnimationData;
        console.log("Current data: ", data);
        // const jsonObj = JSON.parse(data.animation);
        // const prettyJson = JSON.stringify(jsonObj, null, 4);
        // console.log(jsonObj);
        // Update the form values
        setValue("animation", data.animation);
      } else {
        console.log("No such document!");
      }
    });

    return () => {
      unsub();
    };
  }, [setValue]);

  const saveJson = async (value: z.infer<typeof formSchema>) => {
    try {
      console.log(value);
      await setDoc(docRef, { animation: value.animation });
      console.log("Document successfully updated!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
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
  );
}
