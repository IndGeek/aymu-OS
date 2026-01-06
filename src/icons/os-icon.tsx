export const OsIcons = {
    Folder: (props: React.SVGProps<SVGSVGElement>) => {
        const gradientId = `folder-gradient-${Math.random().toString(36).substring(2, 9)}`;
        return (
            <svg
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                {...props}
            >
                <path
                    d="M12 18C12 15.7909 13.7909 14 16 14H32L37 21H64C66.2091 21 68 22.7909 68 25V62C68 64.2091 66.2091 66 64 66H16C13.7909 66 12 64.2091 12 62V18Z"
                    fill={`url(#${gradientId})`}
                />
                <defs>
                    <linearGradient
                        id={gradientId}
                        x1={40}
                        y1={14}
                        x2={40}
                        y2={66}
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#8a88ff" />
                        <stop offset={1} stopColor="#5755e4" />
                    </linearGradient>
                </defs>
            </svg>
        );
    }
    ,
    Music: (props: React.SVGProps<SVGSVGElement>) => (<svg width="800px" height="800px" viewBox="0 0 48 48" version="1" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 48 48">
        <g fill="currentColor">
            <circle cx="19" cy="33" r="9" />
            <polygon points="24,6 24,33 28,33 28,14 39,17 39,10" />
        </g>
    </svg>)
    ,
    File: (props: React.SVGProps<SVGSVGElement>) => (<svg
        width={800}
        height={800}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.342a2 2 0 0 0-.602-1.43l-4.44-4.342A2 2 0 0 0 13.56 2H6a2 2 0 0 0-2 2m5 9h6m-6 4h3"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 2v4a2 2 0 0 0 2 2h4"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </svg>)
    ,

}