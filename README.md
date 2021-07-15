# chat_cluster

![alt text](https://github.com/shoebpatel/chat_cluster/blob/main/design_flow.png)


- ✅  SignUp/login
- ✅  email verification (`"Confirm your email"`)
- ✅  password reset (`"Forgot password"`)

* complexity/difficulty faced while developing this app ?
  ∙ While designing the system it was little challenging to chose either stateful or stateless architecture
   1. StateFul Architecture with session storing on centralizes in-memory cache(like redis) where the user info will store in session &
      on every subsequent request client has to share this session in cookie.

   2. Stateless Architecture with JSON Web Token where the user info is saved in jwt payload & shared with the user 
      & on every subsequent request client has to share this JWT for authentication.
   
  ∙ In able to scale the system for 1 million request the architecture needs to be either stateful or stateless &
    I have gone with stateless architecture where every request is independent & can hit any server to get authenticate
    & there will be no single point of failure like redis incase with session

  ∙ At this much load we need to shard our database means we need to use distributed system & according to the CAP Theorem. It is impossible for a distributed database system to simultaneously provide more that two of it's properties(ie: Consistency, Availability, Partition Tolerance).

  ∙ distributed database system has to make a tradeoff between Consistency and Availability when a Partition occurs.
   1. Consistency + Partition Tolerance = Latency
   2. Availability + Partition Tolerance = Eventual consistency(Not true consistency)

* Did you get to learn anything new / key concepts ?
  ∙ actually learn alot:
   1. Before writing a single peace of code, it's very important to design the system with scalability in mind
   2. Premature optimization gives pain, "Correctness first, performance(optimization) second"
   3. Implementing forgot password flow with nodemailer module
   4. Designed the microservice architecture from scratch

* Do you think this task is gonna benefit you in the job ?
  ∙ 'Yes'
