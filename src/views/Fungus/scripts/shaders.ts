export function genericVertexShader() {
        return `
        varying vec2 textureCoords;
        void main()
        {
                textureCoords = uv;
                gl_Position = projectionMatrix * (modelViewMatrix * vec4(position, 1.0));
        }
        `
}

export function heightMapVertexShader() {
        return `
        varying vec2 textureCoords;
        uniform sampler2D heightMap;
        void main()
        {
                textureCoords = uv;
                gl_Position = projectionMatrix * (modelViewMatrix * vec4(position + vec3(0,0,texture2D(heightMap, uv).r), 1.0));
        }
        `
}

export function uvFragmentShader() {
        return `
        varying vec2 textureCoords;
        void main()
        {
                gl_FragColor = vec4(textureCoords, 0, 1);
        }
        `
}

export function genericFragmentShader() {
        return `
        varying vec2 textureCoords;
        uniform sampler2D textureSource;
        void main()
        {
                gl_FragColor = vec3(texture2D(textureSource, textureCoords),1);
        }
        `
}

export function displayFragmentShader() {
        return `
        varying vec2 textureCoords;
        uniform sampler2D textureSource;
        void main()
        {
                vec4 vp = texture2D(textureSource, textureCoords);
                gl_FragColor = vec4(vp.x,vp.x/2.0,sqrt(vp.y),1);
        }
        `
}

export function brushFragmentShader() {
        return `
        varying vec2 textureCoords;
        uniform vec2 brushCoords;
        uniform sampler2D textureSource;
        uniform float brushSize;
        uniform float brushStrength;
        uniform float scale;
        uniform vec4 mask;
        uniform float max;
        uniform float min;

        void main()
        {
                float amount = 0.0f;
                vec2 diff = brushCoords - textureCoords;
                diff = diff * scale;
                float dist2 = dot(diff, diff);
                amount = brushStrength * exp(- (2.0 / (brushSize * brushSize)) * dist2);
                // float dist = scale * distance(brushCoords, textureCoords);

                gl_FragColor = clamp(vec4(texture2D(textureSource, textureCoords)) + mask * amount, min, max);
                //gl_FragColor = vec4(textureCoords, 0, 1);
                //gl_FragColor = mask * amount;
        }
        `
}

export function simulationFragmentShader() {
        return `
        varying vec2 textureCoords;
        uniform sampler2D varyingParams;
        uniform sampler2D heightMap;
        uniform float NX;
        uniform float NY;
        uniform float scale;
        uniform float dt;

        //fixed parameters
        struct Params {
                float s_I;
                float k_W;
                float d_F;
                float c_I;
                float k_I;
                float l_I;
                float s_F;
                float Diff_F;
                float Diff_I;
                float Conv_I;
                float g_F;
                float W;
                float a;
                float b;
        };
        uniform Params params;

        void main()
        {
                float du = 1.0/NX;
                float dv = 1.0/NY;

                //sample heights
                float H = scale * texture2D(heightMap, textureCoords).r;
                float HXP = scale * texture2D(heightMap, textureCoords + vec2(du, 0.0)).r;
                float HXM = scale * texture2D(heightMap, textureCoords - vec2(du, 0.0)).r;
                float HYP = scale * texture2D(heightMap, textureCoords + vec2(0.0, du)).r;
                float HYM = scale * texture2D(heightMap, textureCoords - vec2(0.0, du)).r;

                //sample varying parameters
                //we are tagging the height into this because it means we don't have to do anything
                //to compute its forward and backward gradients, and because i am a sinister and
                //evil woman who wants to watch things burn :3c
                vec3 VP = vec3(texture2D(varyingParams, textureCoords).rg, H);
                vec3 VPXP = vec3(texture2D(varyingParams, textureCoords + vec2(du, 0.0)).rg, HXP);
                vec3 VPXM = vec3(texture2D(varyingParams, textureCoords - vec2(du, 0.0)).rg, HXM);
                vec3 VPYP = vec3(texture2D(varyingParams, textureCoords + vec2(0.0, dv)).rg, HYP);
                vec3 VPYM = vec3(texture2D(varyingParams, textureCoords - vec2(0.0, dv)).rg, HYM);

                //calculate discretization sizes on manifold
                float dxp = sqrt(du * du * scale * scale + (HXP-H)*(HXP-H));
                float dxm = sqrt(du * du * scale * scale + (HXM-H)*(HXM-H));
                float dyp = sqrt(dv * dv * scale * scale + (HYP-H)*(HYP-H));
                float dym = sqrt(dv * dv * scale * scale + (HYM-H)*(HYM-H));

                //float dxp = du * scale;
                //float dxm = du * scale;
                //float dyp = dv * scale;
                //float dym = dv * scale;

                float dx2 = 0.5 * (dxp + dxm);
                float dy2 = 0.5 * (dyp + dym);

                //calculate centered difference gradient
                float FHX = (HXP - HXM) / (dxp + dxm);
                float FHY = (HYP - HYM) / (dyp + dym);
                float FIX = (VPXP.x - VPXM.x) / (dxp + dxm);
                float FIY = (VPYP.x - VPYM.x) / (dyp + dym);

                //calculate forward/backward gradients
                vec3 FVPXP = (VPXP - VP) / dxp;
                vec3 FVPXM = (VP - VPXM) / dxm;
                vec3 FVPYP = (VPYP - VP) / dyp;
                vec3 FVPYM = (VP - VPYM) / dym;

                //calculate divergences
                vec3 Div = (FVPXP - FVPXM) / dx2 + (FVPYP - FVPYM) / dy2;

                float dF = params.g_F * VP.x * (1.0-params.s_I * VP.y) * (params.W / ( params.W + params.k_W))
                         - params.s_F * VP.x * VP.y
                         - params.d_F * VP.x * VP.x * VP.y
                         + params.Diff_F * Div.x;

                float av_W = 1.0 - pow(params.b, min(0.0, params.a * VP.x - params.W));

                float dI = params.c_I * (params.d_F * VP.x * VP.x + params.s_F * VP.x * VP.y)
                         - params.k_I * VP.y
                         - params.l_I * av_W * VP.y
                         // + params.Conv_I * (VP.y * Div.z + dot(vec2(FIX,FIY), vec2(FHX,FHY))) 
                         + params.Conv_I * dot(vec2(FIX,FIY), vec2(FHX,FHY));
                         + params.Diff_I * Div.y;
                         ;

                vec2 new_VP = VP.xy + dt * vec2(dF, dI);
                new_VP = clamp(new_VP, 0.0, 1.0);

                gl_FragColor = vec4(new_VP, 0, 1);
        }
        `
}
