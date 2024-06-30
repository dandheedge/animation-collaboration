"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import * as R from "ramda";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { Fragment, useCallback, useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { Button } from "./ui/button";
import Lottie from "react-lottie-player";
import { useAnimationStore } from "@/store/animation";
import { Label } from "@radix-ui/react-label";
import { Input } from "./ui/input";
import { debounce } from "@/lib/utils";
import { parseColors } from "@/lib/editor";

const formSchema = z.object({
  animation: z.string(),
});

interface AnimationData {
  animation: string;
}

const docRef = doc(db, "userAnimation", "4wjyWL5Cj5hgAmRzVcvNiSol6uJ3");

export const Editor: React.FC = () => {
  const { animation, setFramerate } = useAnimationStore();
  const [fr, setFr] = useState<number>(animation?.fr || 60);

  useEffect(() => {
    if (animation?.fr !== undefined) {
      setFr(animation.fr);
    }
  }, [animation]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetFramerate = useCallback(
    debounce((newFramerate: number) => {
      setFramerate(newFramerate);
    }, 1000),
    []
  );

  const changeFr = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newFramerate = parseInt(event.target.value, 5);
    if (!isNaN(newFramerate)) {
      setFr(newFramerate);
      debouncedSetFramerate(newFramerate);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <aside className="grid">
        <InputFile />

        {animation && (
          <>
            <Label>Set animation frame rate</Label>
            <Input
              id="fr"
              type="number"
              placeholder="60"
              value={fr}
              onChange={changeFr}
            />
            <TextareaForm />
          </>
        )}
      </aside>
      {animation && (
        <div className="grid">
          <Lottie
            loop
            animationData={animation}
            play
            style={{ width: 500, height: 350 }}
          />
        </div>
      )}
    </div>
  );
};

const InputFile: React.FC = () => {
  const { setAnimation } = useAnimationStore();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result;
        if (fileContent) {
          try {
            const json = JSON.parse(fileContent as string);
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

const Layers: React.FC = () => {
  const { animation } = useAnimationStore();
  const [layers, setLayers] = useState<string[]>([]);
  const [parsedColor, setParsedColor] = useState(
    {} as { [key: string]: unknown }
  );
  useEffect(() => {
    if (animation) {
      const parsedColors = parseColors(animation, true);
      setParsedColor(parsedColors);
      const layersKeys = Object.keys(parsedColors).reverse();
      setLayers(layersKeys);
    }
  }, [animation]);

  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-medium my-4 text-left">Layers</h3>
      {layers.length > 0 &&
        layers.map((key, i) => (
          <Fragment key={key}>
            <LayerShape layer={parsedColor[key]} layerId={i} />
          </Fragment>
        ))}
    </div>
  );
};

interface LayerShapeProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  layer: any;
  layerId: number;
}

const LayerShape: React.FC<LayerShapeProps> = ({ layer }) => {
  const shapes = Object.keys(layer).filter((key) => key !== "layerName");
  const layersName = R.prop("layerName", layer);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extractKeys = (data: any) => {
    const extractRelevantKeys = R.pipe(
      R.values, // Get the values of the main object
      R.flatten, // Flatten the array
      R.filter(R.is(Object)), // Filter out non-object elements
      R.map(R.pick(["color", "itemName", "shapeName"])) // Pick only 'color', 'itemName', and 'shapeName'
    );

    return extractRelevantKeys(data);
  };

  const layersData = extractKeys(layer);
  return (
    <>
      {shapes.map((shape, i) => (
        <Accordion type="single" collapsible key={`${shape}-${i}`}>
          <AccordionItem value={`item-${i}`}>
            <AccordionTrigger>{layersName}</AccordionTrigger>
            {layersData.map((item, j) => (
              <AccordionContent key={j}>
                {item.itemName && (
                  <h4 className="text-left">Item Name: {item.itemName}</h4>
                )}
                {item.shapeName && (
                  <h4 className="text-left">Shape Name: {item.shapeName}</h4>
                )}
                {item.color && (
                  <h4 className="text-left">
                    R: {item.color[0]}, G: {item.color[1]}, B:{item.color[2]}
                  </h4>
                )}
              </AccordionContent>
            ))}
          </AccordionItem>
        </Accordion>
      ))}
    </>
  );
};

const TextareaForm: React.FC = () => {
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
        setAnimation(JSON.parse(data.animation));
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
      setAnimation(JSON.parse(value.animation));
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
};
