
"use client";

import React, { useState } from "react";
// import Link from "next/link";

const AuthSubscriptionFailure: React.FC = () => {

  return (
      <div className="text-center">
        <h2 className="text-xl font-bold mb-4">Premium Subscription Required</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm">
          You don't have a premium BooFi subscription. Subscribe now to unlock AI-driven financial insights.
        </p>
        {/* TODO: this will redirect to app.boofi.xyz subscribe page*/}
        {/* <Link href="/subscribe">
          <a className="text-blue-500 underline">Go to Subscribe Page</a>
        </Link> */}
      </div>
    );
};

export default AuthSubscriptionFailure;
