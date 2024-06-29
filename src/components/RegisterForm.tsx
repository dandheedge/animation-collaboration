import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const formSchema = z.object({
  username: z.string(),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});
export function RegisterForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const lottieDefaultAnimation = {
      nm: "Bouncy Ball",
      v: "5.5.2",
      ip: 0,
      op: 120,
      fr: 60,
      w: 512,
      h: 512,
      layers: [
        {
          ddd: 0,
          ty: 4,
          ind: 0,
          st: 0,
          ip: 0,
          op: 120,
          nm: "Layer",
          ks: {
            a: { a: 0, k: [0, 0] },
            p: { a: 0, k: [0, 0] },
            s: { a: 0, k: [100, 100] },
            r: { a: 0, k: 0 },
            o: { a: 0, k: 100 },
          },
          shapes: [
            {
              ty: "gr",
              nm: "Ellipse Group",
              it: [
                {
                  ty: "el",
                  nm: "Ellipse",
                  p: { a: 0, k: [204, 169] },
                  s: { a: 0, k: [153, 153] },
                },
                {
                  ty: "fl",
                  nm: "Fill",
                  o: { a: 0, k: 100 },
                  c: { a: 0, k: [0.71, 0.192, 0.278] },
                  r: 1,
                },
                {
                  ty: "tr",
                  a: { a: 0, k: [204, 169] },
                  p: {
                    a: 1,
                    k: [
                      {
                        t: 0,
                        s: [235, 106],
                        h: 0,
                        o: { x: [0.333], y: [0] },
                        i: { x: [1], y: [1] },
                      },
                      {
                        t: 60,
                        s: [265, 441],
                        h: 0,
                        o: { x: [0], y: [0] },
                        i: { x: [0.667], y: [1] },
                      },
                      { t: 120, s: [235, 106] },
                    ],
                  },
                  s: {
                    a: 1,
                    k: [
                      {
                        t: 55,
                        s: [100, 100],
                        h: 0,
                        o: { x: [0], y: [0] },
                        i: { x: [1], y: [1] },
                      },
                      {
                        t: 60,
                        s: [136, 59],
                        h: 0,
                        o: { x: [0], y: [0] },
                        i: { x: [1], y: [1] },
                      },
                      { t: 65, s: [100, 100] },
                    ],
                  },
                  r: { a: 0, k: 0 },
                  o: { a: 0, k: 100 },
                },
              ],
            },
          ],
        },
      ],
    };
    const { username, email, password } = values;
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userAnimation", res.user.uid), {
        id: res.user.uid,
        animation: JSON.stringify(lottieDefaultAnimation),
      });

      console.log("Account created");
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Create an account
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
