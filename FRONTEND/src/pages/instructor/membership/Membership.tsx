import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  instructorViewMemberships,
  retrieveActiveMembershipPlan,
} from "../../../api/action/InstructorActionApi";
import Card from "../../../components/common/Card";
import {
  BadgeCheck,
  ShieldCheck,
  Clock,
  Crown,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-toastify";

interface MembershipPlan {
  _id: string;
  name: string;
  durationInDays: number;
  description?: string;
  price?: number;
  benefits?: string[];
}

const Membership: React.FC = () => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [activePlanExpiryDate, setActivePlanExpiryDate] = useState<
    string | null
  >(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const [plansData, activeData] = await Promise.all([
          instructorViewMemberships(),
          retrieveActiveMembershipPlan(),
        ]);

        setPlans(plansData);
        setActivePlanId(activeData?.planId ?? null);
        setActivePlanExpiryDate(activeData?.expiryDate ?? null);
      } catch (error: any) {
        toast.error("Failed to load membership data.");
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading plans...</p>;

 return (
   <div className="p-6 space-y-10">
     {/* ✅ Benefits Overview */}
     <Card padded className="max-w-3xl mx-auto">
       <h2 className="text-2xl font-semibold text-center mb-6">
         Why Become a Mentor?
       </h2>
       <ul className="space-y-4 text-gray-700">
         <li className="flex items-center gap-3">
           <ShieldCheck className="text-green-600 w-6 h-6" />
           Access slot scheduling tools
         </li>
         <li className="flex items-center gap-3">
           <Clock className="text-blue-500 w-6 h-6" />
           Increase visibility and credibility
         </li>
         <li className="flex items-center gap-3">
           <Crown className="text-yellow-500 w-6 h-6" />
           Earn more by mentoring students
         </li>
       </ul>
     </Card>

     {/* ✅ Membership Cards */}
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {plans.map((plan) => {
         const isActive = plan._id === activePlanId;

         return (
           <Card
             key={plan._id}
             withShadow
             padded
             className={`transition hover:shadow-lg ${
               isActive
                 ? "border-2 border-green-500 bg-green-50"
                 : "border border-gray-200"
             }`}
             header={
               <div className="flex items-center gap-2 font-semibold text-primary text-lg">
                 <BadgeCheck className="w-5 h-5" />
                 <span>{plan.name}</span>
               </div>
             }
             footer={
               isActive ? (
                 <div className="text-green-600 font-medium text-center">
                   Current Plan
                   {activePlanExpiryDate && (
                     <p className="text-xs text-gray-600 mt-1">
                       Expires on:{" "}
                       {new Date(activePlanExpiryDate)
                         .toLocaleDateString("en-GB")
                         .replace(/\//g, "-")}
                     </p>
                   )}
                 </div>
               ) : activePlanId ? (
                 <button
                   disabled
                   className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg cursor-not-allowed"
                   onClick={() =>
                     toast.info("You already have an active membership.")
                   }
                 >
                   Buy Plan
                 </button>
               ) : (
                 <button
                   className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
                   onClick={() =>
                     navigate(`/instructor/membership/checkout/${plan._id}`)
                   }
                 >
                   Buy Plan
                 </button>
               )
             }
           >
             <p className="font-medium">Duration: {plan.durationInDays} days</p>

             {plan.price !== undefined && (
               <p className="mt-1 font-medium">Price: ₹{plan.price}</p>
             )}

             {plan.description && (
               <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
             )}

             {/* ✅ Show Benefits */}
             {plan.benefits && plan.benefits.length > 0 && (
               <ul className="mt-3 space-y-2">
                 {plan.benefits.map((benefit, idx) => (
                   <li
                     key={idx}
                     className="flex items-center gap-2 text-sm text-gray-700"
                   >
                     <CheckCircle className="text-green-500 w-4 h-4" />
                     {benefit}
                   </li>
                 ))}
               </ul>
             )}
           </Card>
         );
       })}
     </div>
   </div>
 );

};

export default Membership;
