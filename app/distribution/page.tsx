"use client";

import { useState } from "react";

import {
  useInfiniteQuery
} from "@tanstack/react-query";

import { apiWrapper } from "@/utils/apiClient";

import {
  AnimatePresence,
  motion
} from "framer-motion";
import useShowMailDetailsStore from "@/store/showMailDetails";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import MailCard from "@/components/mail/MailCard";
import MailViewer from "@/components/mail/MailViewer";
import MailListLoader from "@/components/ui/MailListLoader";
import MailListError from "@/components/ui/MailListError";
import { Mail } from "@/types/api/Mail/Mail";
import VirtualKeyboard from "@/components/ui/VirtualKeyboard";


import {
  faKeyboard,
  faInbox,
  faPaperPlane,
  faSortAmountDown,
  faSortAmountUp,

} from "@fortawesome/free-solid-svg-icons";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useUserInfoStore from "@/store/userInfoStore";



// ================= TYPES =================


interface Attachment {

  id: number;

  fileName: string;

  filePath: string;

  fileSize: number;

  mimeType: string;

  isPrimary: boolean;

  uploadedAt: string;

  uploadedBy: string;

  downloadUrl: string | null;

}



interface DistributionMail {


  id: number;


  distributedDate: string;


  status: string;


  readAt: string | null;


  isRead: boolean;


  isAutoDistributed: boolean;


  notes: string | null;



  // inbox fields

  distributorName?: string;

  distributorEmail?: string;

  distributorRole?: string;



  // outbox fields

  receiverId?: number;

  receiverName?: string;

  receiverEmail?: string;

  receiverRole?: string;



  correspondenceId: number;


  correspondenceNumber: string;


  correspondenceTitle: string;


  correspondenceContent: string | null;



  mainType: string;


  isProfessional: boolean;


  documentType: string;


  senderEntity: string | null;


  senderReference: string | null;



  issuedDate: string | null;


  receivedDate: string | null;


  sentDate: string | null;



  attachments: Attachment[];

}




interface PageResponse {

  items: DistributionMail[];

  totalCount: number;

  pageNumber: number;

  pageSize: number;

  totalPages: number;

  hasPreviousPage: boolean;

  hasNextPage: boolean;

}


// Normalize data for MailCard

const normalizeMail = (
  mail: DistributionMail
): any => {

  return {

    // existing MailCard fields

    id: mail.id,

    number:
      mail.correspondenceNumber,


    title:
      mail.correspondenceTitle,


    content:
      mail.correspondenceContent ?? "",



    createdAt:
      mail.distributedDate,



    sender:
      mail.distributorName ??
      mail.receiverName ??
      "غير معروف",



    documentType:
      mail.documentType,



    // required old Mail fields

    documentTypeId:
      0,


    senderEntityId:
      0,


    totalReceivers:
      1,


    senderEntity:
      mail.senderEntity ?? "",


    isProfessional:
      mail.isProfessional,



    mainType:
      mail.mainType,



    status:
      mail.status,



    isRead:
      mail.isRead,



    readAt:
      mail.readAt,



    attachments:
      mail.attachments ?? [],



    // keep original API object

    correspondenceId:
      mail.correspondenceId,


    correspondenceNumber:
      mail.correspondenceNumber,


    correspondenceTitle:
      mail.correspondenceTitle,


    correspondenceContent:
      mail.correspondenceContent,


    distributedDate:
      mail.distributedDate,


    issuedDate:
      mail.issuedDate,


    receivedDate:
      mail.receivedDate,


    sentDate:
      mail.sentDate,

  };

};

export default function MailList() {

  const {
    role,
  } = useUserInfoStore();

  const {

    isMailDetailsStoreShown,

    triggerMailDetailsStoreShown


  } = useShowMailDetailsStore();




  const [

    folder,

    setFolder

  ] = useState<
    "inbox" | "outbox"

  >(
    "inbox"
  );




  const [sortBy, setSortBy] = useState<
    | "DistributedDate"
    | "CorrespondenceTitle"
    | "DistributorName"
  >("DistributedDate");



  const [

    sortDescending,

    setSortDescending

  ] = useState(true);





  const [

    keyboardOpen,

    setKeyboardOpen

  ] = useState(false);


  const [selectedMailData, setSelectedMailData]
    = useState<Mail>();



  const fetchMails = async (

    page: number

  ): Promise<PageResponse> => {


    const endpoint =

      folder === "inbox"

        ?

        "/Distributions/my-inbox"

        :

        "/Distributions/my-outbox";



    const res = await apiWrapper.get<{
      data: PageResponse
    }>(
      endpoint,
      {
        page,
        pageSize: 10,
        sortBy,
        sortDescending
      }
    );



    if (
      !res.success ||
      !res.data
    ) {

      throw new Error(
        "Failed loading mails"
      );

    }



    return res.data.data;


  };



  const {

    data,

    fetchNextPage,

    hasNextPage,

    isFetchingNextPage,

    isLoading,

    isError


  } = useInfiniteQuery<PageResponse>({



    queryKey: [
      "distribution-mails",
      folder,
      sortBy,
      sortDescending
    ],



    queryFn: ({

      pageParam = 1

    }) =>

      fetchMails(

        pageParam as number

      ),




    initialPageParam: 1,




    getNextPageParam: (lastPage) => {


      return lastPage.hasNextPage

        ?

        lastPage.pageNumber + 1

        :

        undefined;


    }


  });


  const mails =
    data?.pages.flatMap(
      page => page.items
    ) ?? [];

  const bottomRef = useInfiniteScroll({


    onBottom: fetchNextPage,


    isLoading: isFetchingNextPage,


    hasMore: !!hasNextPage,


    dataLength: mails.length


  });

  const openMail = (mail: Mail) => {

    setSelectedMailData(mail);

    triggerMailDetailsStoreShown();

  };


  if (isLoading)

    return <MailListLoader />;



  if (isError)

    return <MailListError />;







  return (



    <AnimatePresence mode="wait">



      {

        !isMailDetailsStoreShown



          ?



          <motion.div


            key="mail-list"


            initial={{
              opacity: 0
            }}



            animate={{
              opacity: 1
            }}



            exit={{
              opacity: 0
            }}



            className="
                    flex
                    flex-col
                    h-full
                    w-full
                    "



          >







            {/* HEADER */}



            <div


              className="
                        flex
                        justify-between
                        items-center
                        border-b
                        border-blue-100
                        px-4
                        py-3
                        "


            >







              <div className="
                            flex
                            items-center
                            gap-2
                        ">




                {/* Keyboard */}



                <button


                  onClick={() => setKeyboardOpen(true)}


                  className="
                                flex
                                gap-2
                                items-center
                                px-3
                                py-2
                                bg-white
                                border
                                border-blue-200
                                rounded-lg
                                shadow-sm
                                "


                >



                  <FontAwesomeIcon

                    icon={faKeyboard}

                    className="
                                    text-blue-600
                                    "

                  />



                  <span className="
                                    text-sm
                                    text-gray-600
                                ">

                    لوحة المفاتيح

                  </span>



                </button>








                {/* SORT */}



                <div


                  className="
                                flex
                                items-center
                                gap-1
                                bg-white
                                border
                                border-blue-200
                                rounded-lg
                                px-2
                                py-1
                                shadow-sm
                                "


                >




                  <select


                    value={sortBy}

                    onChange={(e) =>
                      setSortBy(
                        e.target.value as
                        | "DistributedDate"
                        | "CorrespondenceTitle"
                        | "DistributorName"
                      )
                    }



                    className="
                                    text-sm
                                    bg-transparent
                                    outline-none
                                    text-gray-600
                                    "

                  >
                    <option value="DistributedDate">
                      التاريخ
                    </option>

                    <option value="CorrespondenceTitle">
                      العنوان
                    </option>

                    <option value="DistributorName">
                      المرسل
                    </option>

                  </select>






                  <button


                    onClick={() =>


                      setSortDescending(

                        !sortDescending

                      )

                    }



                    className="
                                    text-blue-600
                                    p-1
                                    "

                  >



                    <FontAwesomeIcon

                      icon={

                        sortDescending

                          ?

                          faSortAmountDown

                          :

                          faSortAmountUp

                      }

                    />



                  </button>





                </div>





              </div>





              {/* FOLDER TABS */}


              <div className="
                            flex
                            gap-2
                            bg-blue-50
                            rounded-xl
                            p-1
                        ">


                <button


                  onClick={() => setFolder("inbox")}



                  className={`
                                px-4
                                py-2
                                rounded-lg
                                text-sm
                                transition

                                ${folder === "inbox"

                      ?

                      "bg-blue-600 text-white"

                      :

                      "text-blue-700"

                    }

                                `}


                >


                  <FontAwesomeIcon

                    icon={faInbox}

                    className="ml-1"

                  />


                  الوارد


                </button>






                {role != "User" && <button


                  onClick={() => setFolder("outbox")}



                  className={`

                                px-4
                                py-2
                                rounded-lg
                                text-sm
                                transition


                                ${folder === "outbox"

                      ?

                      "bg-blue-600 text-white"

                      :

                      "text-blue-700"

                    }


                                `}


                >
                  <FontAwesomeIcon

                    icon={faPaperPlane}

                    className="ml-1"

                  />



                  الصادر



                </button>}
              </div>







              <h2 className="
                            text-blue-700
                            font-semibold
                            text-sm
                        ">


                {

                  folder === "inbox"

                    ?

                    "البريد الوارد"

                    :

                    "البريد الصادر"

                }


              </h2>




            </div>







            <VirtualKeyboard


              open={keyboardOpen}


              onClose={() => setKeyboardOpen(false)}


            />










            {/* MAIL LIST */}



            <div


              className="
                        flex
                        flex-col
                        gap-2
                        p-4
                        flex-1
                        overflow-y-auto
                        "


            >



              {

                mails.map(

                  (mail, index) => (

                    <MailCard

                      key={mail.id}

                      mail={normalizeMail(mail)}

                      index={index}

                      onClick={openMail}

                      onEdit={() => { }}

                      onDelete={() => { }}

                      editable={false}
                    />


                  )


                )


              }






              <div ref={bottomRef} />





            </div>






          </motion.div>







          :







          <motion.div



            key="mail-viewer"



            initial={{

              opacity: 0,

              x: 40

            }}



            animate={{

              opacity: 1,

              x: 0

            }}



            exit={{

              opacity: 0,

              x: -40

            }}




            className="
                    p-4
                    w-full
                    "




          >




            {


              selectedMailData &&



              <MailViewer


                data={selectedMailData}



              />


            }





          </motion.div>






      }




    </AnimatePresence>



  );



}